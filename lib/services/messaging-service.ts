/**
 * Messaging Service
 * 
 * Complete backend logic for the messaging system with:
 * - Two message types: System messages and User messages
 * - Permission-based messaging (students can only message teachers)
 * - File type restrictions based on user role
 * - Conversation management
 * - Real-time updates support
 */

import { supabase } from '@/lib/supabase'

// ============================================================================
// Types and Interfaces
// ============================================================================

export type UserType = 'student' | 'teacher' | 'office'
export type MessageType = 'user' | 'system'
export type MessageCategory = 'general' | 'attendance_inquiry' | 'documentation' | 'urgent' | 'system_alert' | 'system_info'
export type SystemMessageCategory = 'attendance_alert' | 'schedule_change' | 'announcement' | 'reminder' | 'warning' | 'info'
export type Severity = 'info' | 'warning' | 'error' | 'success'

export interface User {
  id: string
  type: UserType
  name: string
  avatar?: string
}

export interface Conversation {
  id: string
  lastMessageAt: Date | null
  lastMessagePreview: string | null
  isArchived: boolean
  otherParticipant: {
    id: string
    type: UserType
    name: string
    avatar?: string
  }
  unreadCount: number
  isMuted: boolean
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderType: UserType | 'system'
  senderName: string
  content: string
  messageType: MessageType
  category: MessageCategory
  createdAt: Date
  updatedAt?: Date
  isDeleted: boolean
  attachments: Attachment[]
  isRead: boolean
  metadata?: Record<string, unknown>
  replyToId?: string
  isForwarded?: boolean
  originalSenderName?: string
}

export interface Attachment {
  id: string
  messageId: string
  filename: string
  originalFilename: string
  fileType: string
  fileSize: number
  fileUrl: string
  thumbnailUrl?: string
  uploadedAt: Date
}

export interface SystemMessage {
  id: string
  targetUserId: string
  targetUserType: UserType
  title: string
  content: string
  category: SystemMessageCategory
  severity: Severity
  createdAt: Date
  expiresAt?: Date
  isRead: boolean
  readAt?: Date
  isDismissed: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, unknown>
}

export interface SendMessageInput {
  conversationId?: string
  recipientId: string
  recipientType: UserType
  content: string
  category: MessageCategory
  attachments?: File[]
  replyToId?: string
}

export interface CreateSystemMessageInput {
  targetUserId: string
  targetUserType: UserType
  title: string
  content: string
  category: SystemMessageCategory
  severity: Severity
  expiresAt?: Date
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, unknown>
}

export interface BroadcastResult {
  broadcastId: string
  totalRecipients: number
  deliveredCount: number
}

// ============================================================================
// File Type Restrictions
// ============================================================================

const STUDENT_ALLOWED_MIME_TYPES = [
  'text/plain',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

const STUDENT_MAX_FILE_SIZE = 20 * 1024 * 1024
const TEACHER_OFFICE_MAX_FILE_SIZE = 100 * 1024 * 1024

// ============================================================================
// Permission Validation
// ============================================================================

export function canSendMessageTo(senderType: UserType, recipientType: UserType): boolean {
  if (senderType === 'student') {
    return recipientType === 'teacher'
  }
  if (senderType === 'teacher') {
    return recipientType === 'student' || recipientType === 'office'
  }
  if (senderType === 'office') {
    return recipientType === 'student' || recipientType === 'teacher'
  }
  return false
}

export function isFileAllowed(userType: UserType, file: File): { allowed: boolean; reason?: string } {
  if (userType === 'teacher' || userType === 'office') {
    if (file.size > TEACHER_OFFICE_MAX_FILE_SIZE) {
      return { allowed: false, reason: `File size exceeds ${TEACHER_OFFICE_MAX_FILE_SIZE / 1024 / 1024}MB limit` }
    }
    return { allowed: true }
  }

  if (!STUDENT_ALLOWED_MIME_TYPES.includes(file.type)) {
    return { 
      allowed: false, 
      reason: 'Students can only send text, images (JPG, PNG), PDF, Word, Excel, and PowerPoint files' 
    }
  }
  
  if (file.size > STUDENT_MAX_FILE_SIZE) {
    return { allowed: false, reason: `File size exceeds ${STUDENT_MAX_FILE_SIZE / 1024 / 1024}MB limit` }
  }
  
  return { allowed: true }
}

// ============================================================================
// MessagingService Class
// ============================================================================

export class MessagingService {
  
  async getConversations(userId: string, userType: UserType): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversation_list_view')
      .select('*')
      .eq('user_id', userId)
      .eq('user_type', userType)
      .order('last_message_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      throw new Error('Failed to fetch conversations')
    }

    return (data || []).map(row => ({
      id: row.conversation_id,
      lastMessageAt: row.last_message_at ? new Date(row.last_message_at) : null,
      lastMessagePreview: row.last_message_preview,
      isArchived: row.is_archived,
      otherParticipant: {
        id: row.other_user_id,
        type: row.other_user_type as UserType,
        name: row.other_user_name,
        avatar: row.other_user_avatar,
      },
      unreadCount: row.unread_count,
      isMuted: row.is_muted,
    }))
  }

  async getOrCreateConversation(user1: User, user2: User): Promise<string> {
    const { data: existing } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user1.id)
      .eq('user_type', user1.type)

    if (existing && existing.length > 0) {
      for (const conv of existing) {
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('*')
          .eq('conversation_id', conv.conversation_id)
          .eq('user_id', user2.id)
          .eq('user_type', user2.type)
          .single()

        if (otherParticipant) {
          return conv.conversation_id
        }
      }
    }

    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single()

    if (convError || !newConv) {
      throw new Error('Failed to create conversation')
    }

    await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConv.id, user_id: user1.id, user_type: user1.type, user_name: user1.name, user_avatar: user1.avatar },
        { conversation_id: newConv.id, user_id: user2.id, user_type: user2.type, user_name: user2.name, user_avatar: user2.avatar },
      ])

    return newConv.id
  }

  async getMessages(conversationId: string, userId: string, userType: UserType, limit = 50, offset = 0): Promise<Message[]> {
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .eq('user_type', userType)
      .single()

    if (!participant) {
      throw new Error('You do not have access to this conversation')
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`*, message_attachments (*)`)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error('Failed to fetch messages')
    }

    const messageIds = messages?.map(m => m.id) || []
    const { data: readStatuses } = await supabase
      .from('message_read_status')
      .select('message_id')
      .in('message_id', messageIds)
      .eq('user_id', userId)
      .eq('user_type', userType)

    const readMessageIds = new Set(readStatuses?.map(r => r.message_id) || [])

    return (messages || []).map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      senderType: msg.sender_type as UserType | 'system',
      senderName: msg.sender_name,
      content: msg.content,
      messageType: msg.message_type as MessageType,
      category: msg.category as MessageCategory,
      createdAt: new Date(msg.created_at),
      updatedAt: msg.updated_at ? new Date(msg.updated_at) : undefined,
      isDeleted: msg.is_deleted,
      attachments: (msg.message_attachments || []).map((att: Record<string, unknown>) => ({
        id: att.id as string,
        messageId: att.message_id as string,
        filename: att.filename as string,
        originalFilename: att.original_filename as string,
        fileType: att.file_type as string,
        fileSize: att.file_size as number,
        fileUrl: att.file_url as string,
        thumbnailUrl: att.thumbnail_url as string | undefined,
        uploadedAt: new Date(att.uploaded_at as string),
      })),
      isRead: readMessageIds.has(msg.id),
      metadata: msg.metadata,
      replyToId: msg.reply_to_id,
      isForwarded: msg.is_forwarded,
      originalSenderName: msg.original_sender_name,
    }))
  }

  async sendMessage(sender: User, input: SendMessageInput): Promise<Message> {
    if (!canSendMessageTo(sender.type, input.recipientType)) {
      if (sender.type === 'student' && input.recipientType === 'office') {
        throw new Error('Students cannot message office directly. Please contact your teacher.')
      }
      throw new Error('You do not have permission to message this user')
    }

    if (sender.type === 'student' && input.attachments && input.attachments.length > 0) {
      for (const file of input.attachments) {
        const validation = isFileAllowed(sender.type, file)
        if (!validation.allowed) {
          throw new Error(validation.reason || 'File type not allowed')
        }
      }
    }

    let conversationId = input.conversationId
    if (!conversationId) {
      const recipient = await this.getUserInfo(input.recipientId, input.recipientType)
      conversationId = await this.getOrCreateConversation(sender, recipient)
    }

    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: sender.id,
        sender_type: sender.type,
        sender_name: sender.name,
        content: input.content,
        message_type: 'user',
        category: input.category,
        reply_to_id: input.replyToId,
      })
      .select()
      .single()

    if (msgError || !message) {
      throw new Error('Failed to send message')
    }

    const attachments: Attachment[] = []
    if (input.attachments && input.attachments.length > 0) {
      for (const file of input.attachments) {
        const attachment = await this.uploadAttachment(message.id, file, sender)
        attachments.push(attachment)
      }
    }

    return {
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      senderType: message.sender_type as UserType,
      senderName: message.sender_name,
      content: message.content,
      messageType: message.message_type as MessageType,
      category: message.category as MessageCategory,
      createdAt: new Date(message.created_at),
      isDeleted: false,
      attachments,
      isRead: true,
      replyToId: message.reply_to_id,
    }
  }

  async forwardMessage(sender: User, originalMessageId: string, recipientId: string, recipientType: UserType): Promise<Message> {
    if (!canSendMessageTo(sender.type, recipientType)) {
      throw new Error('You do not have permission to message this user')
    }

    const { data: originalMessage, error: origError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', originalMessageId)
      .single()

    if (origError || !originalMessage) {
      throw new Error('Original message not found')
    }

    const recipient = await this.getUserInfo(recipientId, recipientType)
    const conversationId = await this.getOrCreateConversation(sender, recipient)

    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: sender.id,
        sender_type: sender.type,
        sender_name: sender.name,
        content: originalMessage.content,
        message_type: 'user',
        category: originalMessage.category,
        is_forwarded: true,
        forwarded_from_id: originalMessageId,
        original_sender_name: originalMessage.sender_name,
      })
      .select()
      .single()

    if (msgError || !message) {
      throw new Error('Failed to forward message')
    }

    return {
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      senderType: message.sender_type as UserType,
      senderName: message.sender_name,
      content: message.content,
      messageType: message.message_type as MessageType,
      category: message.category as MessageCategory,
      createdAt: new Date(message.created_at),
      isDeleted: false,
      attachments: [],
      isRead: true,
      isForwarded: true,
      originalSenderName: message.original_sender_name,
    }
  }

  async uploadAttachment(messageId: string, file: File, uploader: User): Promise<Attachment> {
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${sanitizedName}`
    const storagePath = `messages/${messageId}/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(storagePath, file)

    if (uploadError) {
      throw new Error('Failed to upload file')
    }

    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(storagePath)

    const thumbnailUrl = file.type.startsWith('image/') ? urlData.publicUrl : undefined

    const { data: attachment, error: attError } = await supabase
      .from('message_attachments')
      .insert({
        message_id: messageId,
        filename,
        original_filename: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: urlData.publicUrl,
        storage_path: storagePath,
        uploaded_by_id: uploader.id,
        uploaded_by_type: uploader.type,
        thumbnail_url: thumbnailUrl,
      })
      .select()
      .single()

    if (attError || !attachment) {
      throw new Error('Failed to save attachment info')
    }

    return {
      id: attachment.id,
      messageId: attachment.message_id,
      filename: attachment.filename,
      originalFilename: attachment.original_filename,
      fileType: attachment.file_type,
      fileSize: attachment.file_size,
      fileUrl: attachment.file_url,
      thumbnailUrl: attachment.thumbnail_url,
      uploadedAt: new Date(attachment.uploaded_at),
    }
  }

  async markMessagesAsRead(conversationId: string, userId: string, userType: UserType): Promise<void> {
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)

    if (!messages || messages.length === 0) return

    const readStatuses = messages.map(msg => ({
      message_id: msg.id,
      user_id: userId,
      user_type: userType,
    }))

    await supabase
      .from('message_read_status')
      .upsert(readStatuses, { onConflict: 'message_id,user_id,user_type' })

    await supabase
      .from('conversation_participants')
      .update({ unread_count: 0, last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .eq('user_type', userType)
  }

  // Broadcast message to all students in a class (teacher/office only)
  async broadcastToClass(sender: User, classId: string, content: string, category: MessageCategory = 'general'): Promise<BroadcastResult> {
    if (sender.type === 'student') {
      throw new Error('Students cannot send broadcast messages')
    }

    const { data, error } = await supabase.rpc('send_broadcast_to_class', {
      p_sender_id: sender.id,
      p_sender_type: sender.type,
      p_sender_name: sender.name,
      p_class_id: classId,
      p_content: content,
      p_category: category,
    })

    if (error) {
      console.error('Broadcast error:', error)
      throw new Error('Failed to send broadcast message')
    }

    const { data: stats } = await supabase
      .from('broadcast_messages')
      .select('total_recipients, delivered_count')
      .eq('id', data)
      .single()

    return {
      broadcastId: data,
      totalRecipients: stats?.total_recipients || 0,
      deliveredCount: stats?.delivered_count || 0,
    }
  }

  // Search messages
  async searchMessages(userId: string, userType: UserType, query: string, limit = 50): Promise<Message[]> {
    const { data, error } = await supabase.rpc('search_messages', {
      p_user_id: userId,
      p_user_type: userType,
      p_search_query: query,
      p_limit: limit,
      p_offset: 0,
    })

    if (error) {
      throw new Error('Search failed')
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.message_id as string,
      conversationId: row.conversation_id as string,
      senderId: '',
      senderType: 'system' as const,
      senderName: row.sender_name as string,
      content: row.content as string,
      messageType: 'user' as MessageType,
      category: 'general' as MessageCategory,
      createdAt: new Date(row.created_at as string),
      isDeleted: false,
      attachments: [],
      isRead: true,
    }))
  }

  // System Messages
  async getSystemMessages(userId: string, userType: UserType, includeRead = false): Promise<SystemMessage[]> {
    let query = supabase
      .from('system_messages')
      .select('*')
      .eq('target_user_id', userId)
      .eq('target_user_type', userType)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })

    if (!includeRead) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) {
      throw new Error('Failed to fetch system messages')
    }

    return (data || []).map(msg => ({
      id: msg.id,
      targetUserId: msg.target_user_id,
      targetUserType: msg.target_user_type as UserType,
      title: msg.title,
      content: msg.content,
      category: msg.category as SystemMessageCategory,
      severity: msg.severity as Severity,
      createdAt: new Date(msg.created_at),
      expiresAt: msg.expires_at ? new Date(msg.expires_at) : undefined,
      isRead: msg.is_read,
      readAt: msg.read_at ? new Date(msg.read_at) : undefined,
      isDismissed: msg.is_dismissed,
      actionUrl: msg.action_url,
      actionLabel: msg.action_label,
      metadata: msg.metadata,
    }))
  }

  async createSystemMessage(input: CreateSystemMessageInput): Promise<SystemMessage> {
    const { data, error } = await supabase
      .from('system_messages')
      .insert({
        target_user_id: input.targetUserId,
        target_user_type: input.targetUserType,
        title: input.title,
        content: input.content,
        category: input.category,
        severity: input.severity,
        expires_at: input.expiresAt?.toISOString(),
        action_url: input.actionUrl,
        action_label: input.actionLabel,
        metadata: input.metadata,
      })
      .select()
      .single()

    if (error || !data) {
      throw new Error('Failed to create system message')
    }

    return {
      id: data.id,
      targetUserId: data.target_user_id,
      targetUserType: data.target_user_type as UserType,
      title: data.title,
      content: data.content,
      category: data.category as SystemMessageCategory,
      severity: data.severity as Severity,
      createdAt: new Date(data.created_at),
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      isRead: data.is_read,
      isDismissed: data.is_dismissed,
      actionUrl: data.action_url,
      actionLabel: data.action_label,
      metadata: data.metadata,
    }
  }

  async markSystemMessageAsRead(messageId: string): Promise<void> {
    await supabase
      .from('system_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', messageId)
  }

  async dismissSystemMessage(messageId: string): Promise<void> {
    await supabase
      .from('system_messages')
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('id', messageId)
  }

  // Helper Methods
  async getUserInfo(userId: string, userType: UserType): Promise<User> {
    let tableName: string

    switch (userType) {
      case 'student':
        tableName = 'students'
        break
      case 'teacher':
        tableName = 'teachers'
        break
      case 'office':
        tableName = 'users'
        break
      default:
        throw new Error('Invalid user type')
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('id, name')
      .eq('id', userId)
      .single()

    if (error || !data) {
      throw new Error('User not found')
    }

    const userData = data as { id: string; name: string }

    return {
      id: userData.id,
      type: userType,
      name: userData.name || 'Unknown',
    }
  }

  async getAvailableRecipients(userId: string, userType: UserType): Promise<User[]> {
    const recipients: User[] = []

    if (userType === 'student') {
      // Students can only message their teachers
      const { data: studentData } = await supabase
        .from('students')
        .select('class_id')
        .eq('id', userId)
        .single()

      if (studentData?.class_id) {
        const { data: classData } = await supabase
          .from('classes')
          .select('teacher_id, teachers(id, name)')
          .eq('id', studentData.class_id)
          .single()

        if (classData?.teacher_id) {
          const teacher = classData.teachers as unknown as { id: string; name: string }
          if (teacher) {
            recipients.push({
              id: teacher.id,
              type: 'teacher',
              name: teacher.name,
            })
          }
        }
      }
    } else if (userType === 'teacher') {
      // Teachers can message their students and office
      const { data: students } = await supabase
        .from('students')
        .select('id, name')
        .limit(100)

      students?.forEach(student => {
        recipients.push({
          id: student.id,
          type: 'student',
          name: student.name,
        })
      })

      const { data: officeUsers } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'office')

      officeUsers?.forEach(user => {
        recipients.push({
          id: user.id,
          type: 'office',
          name: user.name,
        })
      })
    } else if (userType === 'office') {
      // Office can message everyone
      const { data: students } = await supabase
        .from('students')
        .select('id, name')
        .limit(100)

      students?.forEach(student => {
        recipients.push({
          id: student.id,
          type: 'student',
          name: student.name,
        })
      })

      const { data: teachers } = await supabase
        .from('teachers')
        .select('id, name')

      teachers?.forEach(teacher => {
        recipients.push({
          id: teacher.id,
          type: 'teacher',
          name: teacher.name,
        })
      })
    }

    return recipients
  }
}

// Export singleton instance
export const messagingService = new MessagingService()
