/**
 * Office Messaging Service
 * 
 * Comprehensive messaging service for office users with support for:
 * - Direct messaging with students and teachers
 * - Broadcast messaging to groups
 * - Message templates
 * - File attachments
 * - Message reactions and pinning
 * - Conversation management (pin, star, archive, resolve, mute)
 * - Message scheduling
 * - Search and filtering
 */

import { supabase } from '@/lib/supabase';
import type {
  User,
  UserRole,
  Message,
  MessageDraft,
  Conversation,
  BroadcastMessage,
  BroadcastCriteria,
  MessageTemplate,
  SearchFilters,
  SortOption,
  Attachment,
  ReactionType,
  Reaction,
  ScheduledMessage,
  SendMessageRequest,
  SendBroadcastRequest,
  ScheduleMessageRequest,
  ForwardMessageRequest,
  MessageCategory,
  PriorityLevel,
  DeliveryStatus,
} from '@/types/office/messaging';

import {
  MessageSendError,
  FileUploadError,
  PermissionError,
  ConnectionError,
} from '@/types/office/messaging';

// ============================================================================
// Constants
// ============================================================================

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for office users
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];

const NETWORK_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// ============================================================================
// Office Messaging Service Class
// ============================================================================

export class OfficeMessagingService {
  private currentUser: User | null = null;
  private retryCount: Map<string, number> = new Map();

  /**
   * Initialize the service with the current office user
   */
  setCurrentUser(user: User): void {
    if (user.role !== 'office') {
      throw new PermissionError('This service is only for office users');
    }
    this.currentUser = user;
  }

  /**
   * Get the current user or throw an error
   */
  private getCurrentUser(): User {
    if (!this.currentUser) {
      throw new PermissionError('User not authenticated');
    }
    return this.currentUser;
  }

  /**
   * Check network connectivity
   */
  private async checkNetworkConnectivity(): Promise<void> {
    if (!navigator.onLine) {
      throw new ConnectionError('No internet connection. Please check your network and try again.');
    }
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = MAX_RETRIES
  ): Promise<T> {
    let lastError: Error | null = null;
    const retryKey = operationName;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check network before attempting
        await this.checkNetworkConnectivity();
        
        // Execute operation with timeout
        const result = await Promise.race([
          operation(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new ConnectionError('Operation timed out')), NETWORK_TIMEOUT)
          )
        ]);
        
        // Success - reset retry count
        this.retryCount.delete(retryKey);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on permission errors or validation errors
        if (error instanceof PermissionError || error instanceof FileUploadError) {
          throw error;
        }
        
        // Check if it's a network error
        const isNetworkError = 
          error instanceof ConnectionError ||
          (error as Error).message?.includes('network') ||
          (error as Error).message?.includes('fetch') ||
          (error as Error).message?.includes('timeout');
        
        if (!isNetworkError || attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // All retries failed
    this.retryCount.set(retryKey, (this.retryCount.get(retryKey) || 0) + 1);
    
    if (lastError instanceof ConnectionError) {
      throw lastError;
    }
    
    throw new ConnectionError(
      `Failed to ${operationName} after ${maxRetries} attempts. Please check your connection and try again.`
    );
  }

  // ============================================================================
  // Conversation Management
  // ============================================================================

  /**
   * Get all conversations for the office user
   */
  async getConversations(filters?: SearchFilters, sortBy: SortOption = 'recent'): Promise<Conversation[]> {
    const user = this.getCurrentUser();

    let query = supabase
      .from('conversation_list_view')
      .select('*')
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    // Apply filters
    if (filters?.userType && filters.userType !== 'all') {
      query = query.eq('other_user_type', filters.userType);
    }

    if (filters?.status) {
      if (filters.status === 'unread') {
        query = query.gt('unread_count', 0);
      } else if (filters.status === 'read') {
        query = query.eq('unread_count', 0);
      } else if (filters.status === 'archived') {
        query = query.eq('is_archived', true);
      } else if (filters.status === 'resolved') {
        query = query.eq('is_resolved', true);
      }
    }

    if (filters?.starred) {
      query = query.eq('is_starred', true);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        query = query.order('last_message_at', { ascending: false });
        break;
      case 'unread_first':
        query = query.order('unread_count', { ascending: false }).order('last_message_at', { ascending: false });
        break;
      case 'priority':
        query = query.order('priority', { ascending: false }).order('last_message_at', { ascending: false });
        break;
      case 'alphabetical':
        query = query.order('other_user_name', { ascending: true });
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations');
    }

    return this.mapConversations(data || []);
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const user = this.getCurrentUser();

    const { data, error } = await supabase
      .from('conversation_list_view')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role)
      .single();

    if (error || !data) {
      throw new Error('Conversation not found');
    }

    const conversations = this.mapConversations([data]);
    return conversations[0];
  }
  /**
   * Create or get existing conversation with a user
   */
  async createConversation(recipientId: string, recipientRole: UserRole): Promise<string> {
    const user = this.getCurrentUser();

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (existing && existing.length > 0) {
      for (const conv of existing) {
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('*')
          .eq('conversation_id', conv.conversation_id)
          .eq('user_id', recipientId)
          .eq('user_type', recipientRole)
          .single();

        if (otherParticipant) {
          return conv.conversation_id;
        }
      }
    }

    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convError || !newConv) {
      throw new Error('Failed to create conversation');
    }

    // Get recipient info
    const recipient = await this.getUserInfo(recipientId, recipientRole);

    // Add participants
    await supabase
      .from('conversation_participants')
      .insert([
        { 
          conversation_id: newConv.id, 
          user_id: user.id, 
          user_type: user.role, 
          user_name: user.name, 
          user_avatar: user.avatar 
        },
        { 
          conversation_id: newConv.id, 
          user_id: recipient.id, 
          user_type: recipient.role, 
          user_name: recipient.name, 
          user_avatar: recipient.avatar 
        },
      ]);

    return newConv.id;
  }
  // ============================================================================
  // Message Operations
  // ============================================================================

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    const user = this.getCurrentUser();

    // Verify access to conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role)
      .single();

    if (!participant) {
      throw new PermissionError('You do not have access to this conversation');
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        message_attachments (*),
        message_reactions (*)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error('Failed to fetch messages');
    }

    return this.mapMessages(messages || [], user.id, user.role);
  }

  /**
   * Send a message
   */
  async sendMessage(request: SendMessageRequest): Promise<Message> {
    return this.executeWithRetry(async () => {
      const user = this.getCurrentUser();

      // Validate file attachments
      if (request.attachments && request.attachments.length > 0) {
        for (const file of request.attachments) {
          this.validateFile(file);
        }
      }

      // Get or create conversation
      let conversationId = request.conversationId;
      if (!conversationId) {
        conversationId = await this.createConversation(request.recipientId, request.recipientRole);
      }
      
      // Insert message
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: user.role,
          sender_name: user.name,
          content: request.content,
          message_type: 'user',
          category: request.category,
          priority: request.priority,
          reply_to_id: request.replyToId,
        })
        .select()
        .single();

      if (msgError || !message) {
        throw new MessageSendError('Failed to send message');
      }

      // Upload attachments
      const attachments: Attachment[] = [];
      if (request.attachments && request.attachments.length > 0) {
        for (const file of request.attachments) {
          try {
            const attachment = await this.uploadAttachment(message.id, file);
            attachments.push(attachment);
          } catch (error) {
            console.error('Failed to upload attachment:', error);
            // Continue with other attachments
          }
        }
      }

      return this.mapMessage(message, attachments, [], user.id, user.role);
    }, 'send message');
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, filters?: SearchFilters, limit = 50, offset = 0): Promise<Message[]> {
    const user = this.getCurrentUser();

    const { data, error } = await supabase.rpc('search_messages', {
      p_user_id: user.id,
      p_user_type: user.role,
      p_search_query: query,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      throw new Error('Search failed');
    }

    return this.mapSearchResults(data || []);
  }
  // ============================================================================
  // Message Actions
  // ============================================================================

  /**
   * Pin a message in a conversation
   */
  async pinMessage(messageId: string, conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    // Verify access
    await this.verifyConversationAccess(conversationId);

    const { error } = await supabase
      .from('pinned_messages')
      .insert({
        message_id: messageId,
        conversation_id: conversationId,
        pinned_by_id: user.id,
        pinned_by_type: user.role,
      });

    if (error) {
      throw new Error('Failed to pin message');
    }
  }

  /**
   * Unpin a message
   */
  async unpinMessage(messageId: string): Promise<void> {
    await this.verifyMessageAccess(messageId);

    const { error } = await supabase
      .from('pinned_messages')
      .delete()
      .eq('message_id', messageId);

    if (error) {
      throw new Error('Failed to unpin message');
    }
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(messageId: string, reactionType: ReactionType): Promise<void> {
    const user = this.getCurrentUser();

    await this.verifyMessageAccess(messageId);

    const { error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: user.id,
        user_type: user.role,
        user_name: user.name,
        reaction_type: reactionType,
      });

    if (error) {
      throw new Error('Failed to add reaction');
    }
  }
  /**
   * Remove a reaction from a message
   */
  async removeReaction(messageId: string, reactionType: ReactionType): Promise<void> {
    const user = this.getCurrentUser();

    await this.verifyMessageAccess(messageId);

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('user_type', user.role)
      .eq('reaction_type', reactionType);

    if (error) {
      throw new Error('Failed to remove reaction');
    }
  }

  /**
   * Forward a message to another user
   */
  async forwardMessage(request: ForwardMessageRequest): Promise<Message> {
    const user = this.getCurrentUser();

    // Get original message
    const { data: originalMessage, error: origError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', request.messageId)
      .single();

    if (origError || !originalMessage) {
      throw new Error('Original message not found');
    }

    // Create or get conversation with recipient
    const conversationId = await this.createConversation(request.recipientId, request.recipientRole);

    // Create forwarded message
    const content = request.additionalContext 
      ? `${request.additionalContext}\n\n--- Forwarded Message ---\n${originalMessage.content}`
      : originalMessage.content;

    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: user.role,
        sender_name: user.name,
        content,
        message_type: 'user',
        category: originalMessage.category,
        priority: originalMessage.priority,
        is_forwarded: true,
        forwarded_from_id: request.messageId,
        original_sender_name: originalMessage.sender_name,
      })
      .select()
      .single();

    if (msgError || !message) {
      throw new MessageSendError('Failed to forward message');
    }

    return this.mapMessage(message, [], [], user.id, user.role);
  }
  /**
   * Schedule a message for later delivery
   */
  async scheduleMessage(request: ScheduleMessageRequest): Promise<ScheduledMessage> {
    const user = this.getCurrentUser();

    // Validate scheduled time is in the future
    if (request.scheduledFor <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    const { data, error } = await supabase
      .from('scheduled_messages')
      .insert({
        conversation_id: request.conversationId,
        sender_id: user.id,
        sender_type: user.role,
        sender_name: user.name,
        content: request.draft.content,
        category: request.draft.category,
        scheduled_at: request.scheduledFor.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Failed to schedule message:', error);
      throw new Error('Failed to schedule message');
    }

    return {
      id: data.id,
      draft: request.draft,
      conversationId: request.conversationId,
      recipientId: request.recipientId,
      scheduledFor: new Date(data.scheduled_at),
      status: data.status,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Get scheduled messages
   */
  async getScheduledMessages(): Promise<ScheduledMessage[]> {
    const user = this.getCurrentUser();

    const { data, error } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('sender_id', user.id)
      .eq('sender_type', user.role)
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch scheduled messages:', error);
      throw new Error('Failed to fetch scheduled messages');
    }

    return (data || []).map(msg => ({
      id: msg.id,
      draft: {
        content: msg.content,
        category: msg.category,
        priority: 'normal',
        attachments: [],
      },
      conversationId: msg.conversation_id,
      recipientId: '', // Not stored in table, would need to fetch from conversation
      scheduledFor: new Date(msg.scheduled_at),
      status: msg.status,
      createdAt: new Date(msg.created_at),
    }));
  }
  /**
   * Cancel a scheduled message
   */
  async cancelScheduledMessage(messageId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('scheduled_messages')
      .update({ status: 'cancelled' })
      .eq('id', messageId)
      .eq('sender_id', user.id)
      .eq('sender_type', user.role);

    if (error) {
      throw new Error('Failed to cancel scheduled message');
    }
  }

  // ============================================================================
  // Conversation Actions
  // ============================================================================

  /**
   * Pin a conversation
   */
  async pinConversation(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_pinned: true })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (error) {
      throw new Error('Failed to pin conversation');
    }
  }

  /**
   * Unpin a conversation
   */
  async unpinConversation(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_pinned: false })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (error) {
      throw new Error('Failed to unpin conversation');
    }
  }
  /**
   * Star a conversation
   */
  async starConversation(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_starred: true })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (error) {
      throw new Error('Failed to star conversation');
    }
  }

  /**
   * Unstar a conversation
   */
  async unstarConversation(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_starred: false })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (error) {
      throw new Error('Failed to unstar conversation');
    }
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_archived: true })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (error) {
      throw new Error('Failed to archive conversation');
    }
  }
  /**
   * Unarchive a conversation
   */
  async unarchiveConversation(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_archived: false })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (error) {
      throw new Error('Failed to unarchive conversation');
    }
  }

  /**
   * Resolve a conversation
   */
  async resolveConversation(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_resolved: true })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (error) {
      throw new Error('Failed to resolve conversation');
    }
  }

  /**
   * Unresolve a conversation
   */
  async unresolveConversation(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_resolved: false })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (error) {
      throw new Error('Failed to unresolve conversation');
    }
  }
  /**
   * Mute a conversation
   */
  async muteConversation(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_muted: true })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (error) {
      throw new Error('Failed to mute conversation');
    }
  }

  /**
   * Unmute a conversation
   */
  async unmuteConversation(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_muted: false })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (error) {
      throw new Error('Failed to unmute conversation');
    }
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    // Get all messages in conversation
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id);

    if (!messages || messages.length === 0) return;

    // Mark all as read
    const readStatuses = messages.map(msg => ({
      message_id: msg.id,
      user_id: user.id,
      user_type: user.role,
    }));

    await supabase
      .from('message_read_status')
      .upsert(readStatuses, { onConflict: 'message_id,user_id,user_type' });

    // Update unread count
    await supabase
      .from('conversation_participants')
      .update({ unread_count: 0, last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);
  }
  /**
   * Mark conversation as unread
   */
  async markAsUnread(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ unread_count: 1 })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role);

    if (error) {
      throw new Error('Failed to mark as unread');
    }
  }

  // ============================================================================
  // File Handling
  // ============================================================================

  /**
   * Upload an attachment
   */
  async uploadAttachment(messageId: string, file: File): Promise<Attachment> {
    const user = this.getCurrentUser();

    // Validate file
    this.validateFile(file);

    // Simulate virus scanning (in production, this would be done by a service like ClamAV)
    // For now, we'll just add a delay to simulate the scan
    await this.simulateVirusScan(file);

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;
    const storagePath = `messages/${messageId}/${filename}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(storagePath, file);

    if (uploadError) {
      throw new FileUploadError(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(storagePath);

    const thumbnailUrl = file.type.startsWith('image/') ? urlData.publicUrl : undefined;

    // Save attachment metadata
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
        uploaded_by_id: user.id,
        uploaded_by_type: user.role,
        thumbnail_url: thumbnailUrl,
        virus_scan_status: 'passed', // In production, this would be set by the scanning service
        virus_scan_timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (attError || !attachment) {
      throw new FileUploadError('Failed to save attachment info');
    }

    return {
      id: attachment.id,
      name: attachment.original_filename,
      size: attachment.file_size,
      type: attachment.file_type,
      url: attachment.file_url,
      thumbnailUrl: attachment.thumbnail_url,
    };
  }
  /**
   * Download an attachment
   */
  async downloadAttachment(attachmentId: string): Promise<Blob> {
    const { data: attachment } = await supabase
      .from('message_attachments')
      .select('storage_path')
      .eq('id', attachmentId)
      .single();

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    const { data, error } = await supabase.storage
      .from('message-attachments')
      .download(attachment.storage_path);

    if (error || !data) {
      throw new Error('Failed to download attachment');
    }

    return data;
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
      throw new FileUploadError(
        `File size (${sizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
      );
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new FileUploadError(
        `File type "${file.type}" is not allowed. Please upload images, PDFs, or Office documents.`
      );
    }

    // Check for potentially dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExtension)) {
      throw new FileUploadError(
        `File extension "${fileExtension}" is not allowed for security reasons.`
      );
    }
  }

  /**
   * Simulate virus scanning
   * In production, this would integrate with a real virus scanning service
   */
  private async simulateVirusScan(file: File): Promise<void> {
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production, this would call a virus scanning API
    // For now, we'll just check for suspicious file names
    const suspiciousPatterns = ['virus', 'malware', 'trojan', 'ransomware'];
    const fileName = file.name.toLowerCase();
    
    for (const pattern of suspiciousPatterns) {
      if (fileName.includes(pattern)) {
        throw new FileUploadError(
          'File failed security scan. The file appears to contain suspicious content.'
        );
      }
    }

    // File passed scan
  }

  // ============================================================================
  // Template Management
  // ============================================================================

  /**
   * Get all message templates
   */
  async getTemplates(): Promise<MessageTemplate[]> {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    // If table doesn't exist or error, return default templates
    if (error) {
      console.warn('Message templates table not found, using default templates');
      return this.getDefaultTemplates();
    }

    return (data || []).map(template => ({
      id: template.id,
      name: template.name,
      content: template.content,
      category: template.category,
      variables: template.variables || [],
      usageCount: template.usage_count || 0,
    }));
  }

  /**
   * Get default message templates (fallback when database table doesn't exist)
   */
  private getDefaultTemplates(): MessageTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'Welcome Message',
        content: 'Welcome {{recipientName}}! We are glad to have you here.',
        category: 'general',
        variables: ['recipientName'],
        usageCount: 0,
      },
      {
        id: 'template-2',
        name: 'Attendance Reminder',
        content: 'Dear {{recipientName}}, this is a reminder about your attendance. Please ensure regular attendance.',
        category: 'attendance_alert',
        variables: ['recipientName'],
        usageCount: 0,
      },
      {
        id: 'template-3',
        name: 'Schedule Change Notice',
        content: 'Hello {{recipientName}}, please note that the schedule for {{day}} has been changed. Check the updated schedule.',
        category: 'schedule_change',
        variables: ['recipientName', 'day'],
        usageCount: 0,
      },
      {
        id: 'template-4',
        name: 'General Announcement',
        content: 'Dear {{recipientName}}, we would like to inform you about an important announcement.',
        category: 'announcement',
        variables: ['recipientName'],
        usageCount: 0,
      },
      {
        id: 'template-5',
        name: 'Urgent Notice',
        content: 'URGENT: {{recipientName}}, please contact the office immediately regarding an important matter.',
        category: 'urgent',
        variables: ['recipientName'],
        usageCount: 0,
      },
      {
        id: 'template-6',
        name: 'Meeting Request',
        content: 'Dear {{recipientName}}, we would like to schedule a meeting with you on {{date}} at {{time}}.',
        category: 'administrative',
        variables: ['recipientName', 'date', 'time'],
        usageCount: 0,
      },
      {
        id: 'template-7',
        name: 'Document Request',
        content: 'Hello {{recipientName}}, please submit the required documents by {{date}}.',
        category: 'administrative',
        variables: ['recipientName', 'date'],
        usageCount: 0,
      },
      {
        id: 'template-8',
        name: 'Exam Reminder',
        content: 'Dear {{recipientName}}, this is a reminder that your exam is scheduled for {{date}}. Please prepare accordingly.',
        category: 'announcement',
        variables: ['recipientName', 'date'],
        usageCount: 0,
      },
      {
        id: 'template-9',
        name: 'Holiday Notice',
        content: 'Dear {{recipientName}}, please note that the office will be closed on {{date}} for {{reason}}.',
        category: 'announcement',
        variables: ['recipientName', 'date', 'reason'],
        usageCount: 0,
      },
      {
        id: 'template-10',
        name: 'Follow-up Message',
        content: 'Hello {{recipientName}}, following up on our previous conversation. Please let us know if you need any assistance.',
        category: 'general',
        variables: ['recipientName'],
        usageCount: 0,
      },
      {
        id: 'template-11',
        name: 'Thank You Message',
        content: 'Dear {{recipientName}}, thank you for your cooperation and support.',
        category: 'general',
        variables: ['recipientName'],
        usageCount: 0,
      },
      {
        id: 'template-12',
        name: 'Absence Follow-up',
        content: 'Dear {{recipientName}}, we noticed your absence on {{date}}. Please provide a valid reason or medical certificate.',
        category: 'attendance_alert',
        variables: ['recipientName', 'date'],
        usageCount: 0,
      },
    ];
  }
  // ============================================================================
  // Broadcast Messaging
  // ============================================================================

  /**
   * Send a broadcast message to a group
   */
  async sendBroadcast(request: SendBroadcastRequest): Promise<BroadcastMessage> {
    const user = this.getCurrentUser();

    // Validate attachments
    if (request.attachments && request.attachments.length > 0) {
      for (const file of request.attachments) {
        this.validateFile(file);
      }
    }

    // Determine recipients based on criteria
    const recipients = await this.getBroadcastRecipients(request.criteria);

    if (recipients.length === 0) {
      throw new Error('No recipients found for broadcast criteria');
    }

    // Create broadcast record
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcast_messages')
      .insert({
        sender_id: user.id,
        sender_type: user.role,
        sender_name: user.name,
        content: request.content,
        category: request.category,
        priority: request.priority,
        criteria: request.criteria,
        total_recipients: recipients.length,
      })
      .select()
      .single();

    if (broadcastError || !broadcast) {
      throw new Error('Failed to create broadcast');
    }

    // Send individual messages to each recipient
    let deliveredCount = 0;
    const failedRecipients: string[] = [];

    for (const recipient of recipients) {
      try {
        const conversationId = await this.createConversation(recipient.id, recipient.role);

        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            sender_type: user.role,
            sender_name: user.name,
            content: request.content,
            message_type: 'user',
            category: request.category,
            priority: request.priority,
            broadcast_id: broadcast.id,
          });

        deliveredCount++;
      } catch (error) {
        console.error(`Failed to send to ${recipient.id}:`, error);
        failedRecipients.push(recipient.id);
      }
    }

    // Update broadcast stats
    await supabase
      .from('broadcast_messages')
      .update({
        delivered_count: deliveredCount,
        failed_count: failedRecipients.length,
        failed_recipients: failedRecipients,
      })
      .eq('id', broadcast.id);

    return {
      id: broadcast.id,
      senderId: user.id,
      content: request.content,
      category: request.category,
      priority: request.priority,
      attachments: [],
      criteria: request.criteria,
      recipientCount: recipients.length,
      deliveredCount,
      readCount: 0,
      failedCount: failedRecipients.length,
      failedRecipients,
      timestamp: new Date(broadcast.created_at),
    };
  }
  /**
   * Get broadcast history
   */
  async getBroadcastHistory(): Promise<BroadcastMessage[]> {
    const user = this.getCurrentUser();

    const { data, error } = await supabase
      .from('broadcast_messages')
      .select('*')
      .eq('sender_id', user.id)
      .eq('sender_type', user.role)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch broadcast history');
    }

    return (data || []).map(broadcast => ({
      id: broadcast.id,
      senderId: broadcast.sender_id,
      content: broadcast.content,
      category: broadcast.category,
      priority: broadcast.priority,
      attachments: [],
      criteria: broadcast.criteria,
      recipientCount: broadcast.total_recipients,
      deliveredCount: broadcast.delivered_count,
      readCount: broadcast.read_count || 0,
      failedCount: broadcast.failed_count || 0,
      failedRecipients: broadcast.failed_recipients || [],
      timestamp: new Date(broadcast.created_at),
    }));
  }

  /**
   * Get broadcast details
   */
  async getBroadcastDetails(broadcastId: string): Promise<BroadcastMessage> {
    const user = this.getCurrentUser();

    const { data, error } = await supabase
      .from('broadcast_messages')
      .select('*')
      .eq('id', broadcastId)
      .eq('sender_id', user.id)
      .eq('sender_type', user.role)
      .single();

    if (error || !data) {
      throw new Error('Broadcast not found');
    }

    return {
      id: data.id,
      senderId: data.sender_id,
      content: data.content,
      category: data.category,
      priority: data.priority,
      attachments: [],
      criteria: data.criteria,
      recipientCount: data.total_recipients,
      deliveredCount: data.delivered_count,
      readCount: data.read_count || 0,
      failedCount: data.failed_count || 0,
      failedRecipients: data.failed_recipients || [],
      timestamp: new Date(data.created_at),
    };
  }
  /**
   * Retry failed broadcast deliveries
   */
  async retryFailedBroadcast(broadcastId: string): Promise<void> {
    const broadcast = await this.getBroadcastDetails(broadcastId);

    if (broadcast.failedRecipients.length === 0) {
      return;
    }

    const user = this.getCurrentUser();
    let retriedCount = 0;

    for (const recipientId of broadcast.failedRecipients) {
      try {
        // Determine recipient role (would need to be stored or looked up)
        const recipient = await this.getUserInfo(recipientId, 'student'); // Default to student
        const conversationId = await this.createConversation(recipient.id, recipient.role);

        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            sender_type: user.role,
            sender_name: user.name,
            content: broadcast.content,
            message_type: 'user',
            category: broadcast.category,
            priority: broadcast.priority,
            broadcast_id: broadcastId,
          });

        retriedCount++;
      } catch (error) {
        console.error(`Failed to retry delivery to ${recipientId}:`, error);
      }
    }

    // Update broadcast stats
    await supabase
      .from('broadcast_messages')
      .update({
        delivered_count: broadcast.deliveredCount + retriedCount,
        failed_count: broadcast.failedCount - retriedCount,
      })
      .eq('id', broadcastId);
  }

  /**
   * Get recipients for broadcast criteria
   */
  private async getBroadcastRecipients(criteria: BroadcastCriteria): Promise<User[]> {
    const recipients: User[] = [];

    switch (criteria.type) {
      case 'all_students': {
        const { data } = await supabase
          .from('students')
          .select('id, first_name, last_name');

        data?.forEach(student => {
          recipients.push({
            id: student.id,
            role: 'student',
            name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          });
        });
        break;
      }

      case 'specific_class': {
        if (!criteria.className || !criteria.session) {
          throw new Error('Class name and session required');
        }

        const classSection = `${criteria.className} - ${criteria.session}`;
        const { data } = await supabase
          .from('students')
          .select('id, first_name, last_name')
          .eq('class_section', classSection);

        data?.forEach(student => {
          recipients.push({
            id: student.id,
            role: 'student',
            name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          });
        });
        break;
      }

      case 'all_teachers': {
        const { data } = await supabase
          .from('teachers')
          .select('id, first_name, last_name');

        data?.forEach(teacher => {
          recipients.push({
            id: teacher.id,
            role: 'teacher',
            name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim(),
          });
        });
        break;
      }

      case 'specific_department': {
        if (!criteria.department) {
          throw new Error('Department required');
        }

        const { data } = await supabase
          .from('teachers')
          .select('id, first_name, last_name')
          .eq('departments', criteria.department);

        data?.forEach(teacher => {
          recipients.push({
            id: teacher.id,
            role: 'teacher',
            name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim(),
          });
        });
        break;
      }
    }

    return recipients;
  }
  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Get user information
   */
  private async getUserInfo(userId: string, userRole: UserRole): Promise<User> {
    let tableName: string;
    let nameFields: string;

    switch (userRole) {
      case 'student':
        tableName = 'students';
        nameFields = 'id, first_name, last_name';
        break;
      case 'teacher':
        tableName = 'teachers';
        nameFields = 'id, first_name, last_name';
        break;
      case 'office':
        tableName = 'office_staff';
        nameFields = 'id, first_name, last_name';
        break;
      default:
        throw new Error('Invalid user type');
    }

    const { data, error } = await supabase
      .from(tableName)
      .select(nameFields)
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error('User not found');
    }

    const userData = data as unknown as Record<string, unknown>;
    const firstName = (userData.first_name as string) || '';
    const lastName = (userData.last_name as string) || '';
    const userName = `${firstName} ${lastName}`.trim() || 'Unknown';

    return {
      id: userData.id as string,
      role: userRole,
      name: userName,
    };
  }

  /**
   * Verify access to a conversation
   */
  private async verifyConversationAccess(conversationId: string): Promise<void> {
    const user = this.getCurrentUser();

    const { data } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('user_type', user.role)
      .single();

    if (!data) {
      throw new PermissionError('You do not have access to this conversation');
    }
  }
  /**
   * Verify access to a message
   */
  private async verifyMessageAccess(messageId: string): Promise<void> {
    const { data: message } = await supabase
      .from('messages')
      .select('conversation_id')
      .eq('id', messageId)
      .single();

    if (!message) {
      throw new Error('Message not found');
    }

    await this.verifyConversationAccess(message.conversation_id);
  }

  /**
   * Map database conversations to Conversation type
   */
  private mapConversations(data: Record<string, unknown>[]): Conversation[] {
    return data.map(row => ({
      id: row.conversation_id as string,
      recipientId: row.other_user_id as string,
      recipientName: row.other_user_name as string,
      recipientRole: row.other_user_type as UserRole,
      recipientAvatar: row.other_user_avatar as string | undefined,
      lastMessage: {
        id: '',
        conversationId: row.conversation_id as string,
        senderId: '',
        senderName: '',
        senderRole: 'office',
        content: row.last_message_preview as string || '',
        category: 'general',
        priority: 'normal',
        status: 'sent',
        attachments: [],
        reactions: [],
        isPinned: false,
        isForwarded: false,
        timestamp: row.last_message_at ? new Date(row.last_message_at as string) : new Date(),
      },
      unreadCount: row.unread_count as number,
      isPinned: row.is_pinned as boolean || false,
      isStarred: row.is_starred as boolean || false,
      isArchived: row.is_archived as boolean || false,
      isResolved: row.is_resolved as boolean || false,
      isMuted: row.is_muted as boolean || false,
      pinnedMessages: [],
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    }));
  }

  /**
   * Map database messages to Message type
   */
  private mapMessages(data: Record<string, unknown>[], userId: string, userRole: UserRole): Message[] {
    return data.map(msg => {
      const attachments = (msg.message_attachments as Record<string, unknown>[]) || [];
      const reactions = (msg.message_reactions as Record<string, unknown>[]) || [];

      return this.mapMessage(msg, 
        attachments.map(att => ({
          id: att.id as string,
          name: att.original_filename as string,
          size: att.file_size as number,
          type: att.file_type as string,
          url: att.file_url as string,
          thumbnailUrl: att.thumbnail_url as string | undefined,
        })),
        reactions.map(react => ({
          type: react.reaction_type as ReactionType,
          userId: react.user_id as string,
          userName: react.user_name as string,
          timestamp: new Date(react.created_at as string),
        })),
        userId,
        userRole
      );
    });
  }
  /**
   * Map a single message
   */
  private mapMessage(
    msg: Record<string, unknown>, 
    attachments: Attachment[], 
    reactions: Reaction[],
    userId: string,
    userRole: UserRole
  ): Message {
    return {
      id: msg.id as string,
      conversationId: msg.conversation_id as string,
      senderId: msg.sender_id as string,
      senderName: msg.sender_name as string,
      senderRole: msg.sender_type as UserRole,
      content: msg.content as string,
      category: (msg.category as 'administrative' | 'attendance_alert' | 'schedule_change' | 'announcement' | 'general' | 'urgent') || 'general',
      priority: (msg.priority as 'normal' | 'important' | 'urgent') || 'normal',
      status: this.getMessageStatus(msg, userId, userRole),
      attachments,
      reactions,
      isPinned: msg.is_pinned as boolean || false,
      isForwarded: msg.is_forwarded as boolean || false,
      forwardedFrom: msg.is_forwarded ? {
        senderId: msg.forwarded_from_id as string,
        senderName: msg.original_sender_name as string,
      } : undefined,
      replyTo: msg.reply_to_id as string | undefined,
      timestamp: new Date(msg.created_at as string),
      readAt: msg.read_at ? new Date(msg.read_at as string) : undefined,
      deliveredAt: msg.delivered_at ? new Date(msg.delivered_at as string) : undefined,
    };
  }

  /**
   * Get message delivery status
   */
  private getMessageStatus(msg: Record<string, unknown>, userId: string, userRole: UserRole): 'sending' | 'sent' | 'delivered' | 'read' | 'failed' {
    if (msg.sender_id === userId && msg.sender_type === userRole) {
      // Message sent by current user
      if (msg.read_at) return 'read';
      if (msg.delivered_at) return 'delivered';
      return 'sent';
    }
    return 'delivered';
  }

  /**
   * Map search results to messages
   */
  private mapSearchResults(data: Record<string, unknown>[]): Message[] {
    return data.map(row => ({
      id: row.message_id as string,
      conversationId: row.conversation_id as string,
      senderId: '',
      senderName: row.sender_name as string,
      senderRole: 'office',
      content: row.content as string,
      category: 'general',
      priority: 'normal',
      status: 'sent',
      attachments: [],
      reactions: [],
      isPinned: false,
      isForwarded: false,
      timestamp: new Date(row.created_at as string),
    }));
  }
}

// Export singleton instance
export const officeMessagingService = new OfficeMessagingService();
