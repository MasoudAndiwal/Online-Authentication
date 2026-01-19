/**
 * useLanguage Hook
 * 
 * Custom hook for managing language and text direction with i18n support.
 * Handles language switching, RTL/LTR direction, translation function, and persistence.
 * 
 * Requirements: 25.1, 25.2, 25.3, 25.4, 25.5
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useMessaging } from './use-messaging-context';
import type { Language, TextDirection } from '@/types/office/messaging';

// ============================================================================
// Translation Keys Type
// ============================================================================

type TranslationKey = string;

// ============================================================================
// Translation Dictionaries
// ============================================================================

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'common.send': 'Send',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.retry': 'Retry',
    'common.close': 'Close',
    
    // Messaging
    'messaging.newConversation': 'New Conversation',
    'messaging.typeMessage': 'Type a message...',
    'messaging.sendMessage': 'Send Message',
    'messaging.attachFile': 'Attach File',
    'messaging.scheduleMessage': 'Schedule Message',
    'messaging.selectTemplate': 'Select Template',
    'messaging.noConversations': 'No conversations yet',
    'messaging.noMessages': 'No messages yet',
    'messaging.messageSent': 'Message sent',
    'messaging.messageFailed': 'Failed to send message',
    
    // Conversations
    'conversations.all': 'All Conversations',
    'conversations.unread': 'Unread',
    'conversations.starred': 'Starred',
    'conversations.archived': 'Archived',
    'conversations.resolved': 'Resolved',
    'conversations.pin': 'Pin',
    'conversations.unpin': 'Unpin',
    'conversations.star': 'Star',
    'conversations.unstar': 'Unstar',
    'conversations.archive': 'Archive',
    'conversations.unarchive': 'Unarchive',
    'conversations.resolve': 'Resolve',
    'conversations.unresolve': 'Unresolve',
    'conversations.mute': 'Mute',
    'conversations.unmute': 'Unmute',
    'conversations.markAsRead': 'Mark as Read',
    'conversations.markAsUnread': 'Mark as Unread',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.markAllRead': 'Mark All as Read',
    'notifications.clearAll': 'Clear All',
    'notifications.settings': 'Notification Settings',
    'notifications.quietHours': 'Quiet Hours',
    'notifications.quietHoursActive': 'Quiet Hours Active',
    'notifications.sound': 'Sound',
    'notifications.preview': 'Preview',
    'notifications.grouping': 'Group Notifications',
    'notifications.browserNotifications': 'Browser Notifications',
    
    // Categories
    'category.administrative': 'Administrative',
    'category.attendance_alert': 'Attendance Alert',
    'category.schedule_change': 'Schedule Change',
    'category.announcement': 'Announcement',
    'category.general': 'General',
    'category.urgent': 'Urgent',
    
    // Priority
    'priority.normal': 'Normal',
    'priority.important': 'Important',
    'priority.urgent': 'Urgent',
    
    // Broadcast
    'broadcast.title': 'Broadcast Message',
    'broadcast.selectRecipients': 'Select Recipients',
    'broadcast.allStudents': 'All Students',
    'broadcast.specificClass': 'Specific Class',
    'broadcast.allTeachers': 'All Teachers',
    'broadcast.specificDepartment': 'Specific Department',
    'broadcast.recipientCount': 'Recipients: {{count}}',
    'broadcast.send': 'Send Broadcast',
    'broadcast.confirm': 'Confirm Broadcast',
    'broadcast.success': 'Broadcast sent successfully',
    
    // Errors
    'error.loadConversations': 'Failed to load conversations',
    'error.loadMessages': 'Failed to load messages',
    'error.sendMessage': 'Failed to send message',
    'error.uploadFile': 'Failed to upload file',
    'error.fileTooLarge': 'File is too large',
    'error.fileTypeNotAllowed': 'File type not allowed',
    'error.connectionLost': 'Connection lost',
    'error.reconnecting': 'Reconnecting...',
  },
  fa: {
    // Common (Dari/Farsi)
    'common.send': 'ارسال',
    'common.cancel': 'لغو',
    'common.save': 'ذخیره',
    'common.delete': 'حذف',
    'common.edit': 'ویرایش',
    'common.search': 'جستجو',
    'common.filter': 'فیلتر',
    'common.sort': 'مرتب‌سازی',
    'common.loading': 'در حال بارگذاری...',
    'common.error': 'خطا',
    'common.success': 'موفق',
    'common.retry': 'تلاش مجدد',
    'common.close': 'بستن',
    
    // Messaging
    'messaging.newConversation': 'گفتگوی جدید',
    'messaging.typeMessage': 'پیام خود را بنویسید...',
    'messaging.sendMessage': 'ارسال پیام',
    'messaging.attachFile': 'پیوست فایل',
    'messaging.scheduleMessage': 'زمان‌بندی پیام',
    'messaging.selectTemplate': 'انتخاب قالب',
    'messaging.noConversations': 'هنوز گفتگویی وجود ندارد',
    'messaging.noMessages': 'هنوز پیامی وجود ندارد',
    'messaging.messageSent': 'پیام ارسال شد',
    'messaging.messageFailed': 'ارسال پیام ناموفق بود',
    
    // Conversations
    'conversations.all': 'همه گفتگوها',
    'conversations.unread': 'خوانده نشده',
    'conversations.starred': 'ستاره‌دار',
    'conversations.archived': 'بایگانی شده',
    'conversations.resolved': 'حل شده',
    'conversations.pin': 'سنجاق کردن',
    'conversations.unpin': 'برداشتن سنجاق',
    'conversations.star': 'ستاره دادن',
    'conversations.unstar': 'برداشتن ستاره',
    'conversations.archive': 'بایگانی',
    'conversations.unarchive': 'خارج از بایگانی',
    'conversations.resolve': 'حل کردن',
    'conversations.unresolve': 'باز کردن مجدد',
    'conversations.mute': 'بی‌صدا کردن',
    'conversations.unmute': 'فعال کردن صدا',
    'conversations.markAsRead': 'علامت به عنوان خوانده شده',
    'conversations.markAsUnread': 'علامت به عنوان خوانده نشده',
    
    // Notifications
    'notifications.title': 'اعلان‌ها',
    'notifications.markAllRead': 'همه را خوانده شده علامت بزن',
    'notifications.clearAll': 'پاک کردن همه',
    'notifications.settings': 'تنظیمات اعلان',
    'notifications.quietHours': 'ساعات سکوت',
    'notifications.quietHoursActive': 'ساعات سکوت فعال',
    'notifications.sound': 'صدا',
    'notifications.preview': 'پیش‌نمایش',
    'notifications.grouping': 'گروه‌بندی اعلان‌ها',
    'notifications.browserNotifications': 'اعلان‌های مرورگر',
    
    // Categories
    'category.administrative': 'اداری',
    'category.attendance_alert': 'هشدار حضور',
    'category.schedule_change': 'تغییر برنامه',
    'category.announcement': 'اعلامیه',
    'category.general': 'عمومی',
    'category.urgent': 'فوری',
    
    // Priority
    'priority.normal': 'عادی',
    'priority.important': 'مهم',
    'priority.urgent': 'فوری',
    
    // Broadcast
    'broadcast.title': 'پیام گروهی',
    'broadcast.selectRecipients': 'انتخاب گیرندگان',
    'broadcast.allStudents': 'همه دانشجویان',
    'broadcast.specificClass': 'کلاس خاص',
    'broadcast.allTeachers': 'همه اساتید',
    'broadcast.specificDepartment': 'بخش خاص',
    'broadcast.recipientCount': 'گیرندگان: {{count}}',
    'broadcast.send': 'ارسال پیام گروهی',
    'broadcast.confirm': 'تأیید پیام گروهی',
    'broadcast.success': 'پیام گروهی با موفقیت ارسال شد',
    
    // Errors
    'error.loadConversations': 'بارگذاری گفتگوها ناموفق بود',
    'error.loadMessages': 'بارگذاری پیام‌ها ناموفق بود',
    'error.sendMessage': 'ارسال پیام ناموفق بود',
    'error.uploadFile': 'بارگذاری فایل ناموفق بود',
    'error.fileTooLarge': 'فایل بسیار بزرگ است',
    'error.fileTypeNotAllowed': 'نوع فایل مجاز نیست',
    'error.connectionLost': 'اتصال قطع شد',
    'error.reconnecting': 'در حال اتصال مجدد...',
  },
  ps: {
    // Common (Pashto)
    'common.send': 'لیږل',
    'common.cancel': 'لغوه',
    'common.save': 'خوندي کول',
    'common.delete': 'حذف',
    'common.edit': 'سمون',
    'common.search': 'لټون',
    'common.filter': 'فلټر',
    'common.sort': 'ترتیب',
    'common.loading': 'بارېږي...',
    'common.error': 'تېروتنه',
    'common.success': 'بریالی',
    'common.retry': 'بیا هڅه',
    'common.close': 'تړل',
    
    // Messaging
    'messaging.newConversation': 'نوې خبرې اترې',
    'messaging.typeMessage': 'خپل پیغام ولیکئ...',
    'messaging.sendMessage': 'پیغام لیږل',
    'messaging.attachFile': 'فایل ضمیمه کول',
    'messaging.scheduleMessage': 'پیغام مهالویش',
    'messaging.selectTemplate': 'کينډۍ غوره کول',
    'messaging.noConversations': 'تر اوسه خبرې اترې نشته',
    'messaging.noMessages': 'تر اوسه پیغامونه نشته',
    'messaging.messageSent': 'پیغام ولیږل شو',
    'messaging.messageFailed': 'پیغام لیږل ناکام شو',
    
    // Conversations
    'conversations.all': 'ټولې خبرې اترې',
    'conversations.unread': 'نه لوستل شوي',
    'conversations.starred': 'ستوري شوي',
    'conversations.archived': 'آرشیف شوي',
    'conversations.resolved': 'حل شوي',
    'conversations.pin': 'پین کول',
    'conversations.unpin': 'پین لرې کول',
    'conversations.star': 'ستوری ورکول',
    'conversations.unstar': 'ستوری لرې کول',
    'conversations.archive': 'آرشیف',
    'conversations.unarchive': 'له آرشیف څخه وباسئ',
    'conversations.resolve': 'حل کول',
    'conversations.unresolve': 'بیا خلاصول',
    'conversations.mute': 'غږ بند کول',
    'conversations.unmute': 'غږ فعالول',
    'conversations.markAsRead': 'د لوستل شوي په توګه نښه کول',
    'conversations.markAsUnread': 'د نه لوستل شوي په توګه نښه کول',
    
    // Notifications
    'notifications.title': 'خبرتیاوې',
    'notifications.markAllRead': 'ټول لوستل شوي نښه کړئ',
    'notifications.clearAll': 'ټول پاک کړئ',
    'notifications.settings': 'د خبرتیا تنظیمات',
    'notifications.quietHours': 'خاموش ساعتونه',
    'notifications.quietHoursActive': 'خاموش ساعتونه فعال',
    'notifications.sound': 'غږ',
    'notifications.preview': 'مخکتنه',
    'notifications.grouping': 'د خبرتیاوو ګروپ کول',
    'notifications.browserNotifications': 'د براوزر خبرتیاوې',
    
    // Categories
    'category.administrative': 'اداري',
    'category.attendance_alert': 'د حاضرۍ خبرتیا',
    'category.schedule_change': 'د مهالویش بدلون',
    'category.announcement': 'اعلان',
    'category.general': 'عمومي',
    'category.urgent': 'بیړنی',
    
    // Priority
    'priority.normal': 'عادي',
    'priority.important': 'مهم',
    'priority.urgent': 'بیړنی',
    
    // Broadcast
    'broadcast.title': 'ګروپي پیغام',
    'broadcast.selectRecipients': 'ترلاسه کوونکي غوره کړئ',
    'broadcast.allStudents': 'ټول زده کوونکي',
    'broadcast.specificClass': 'ځانګړی ټولګی',
    'broadcast.allTeachers': 'ټول ښوونکي',
    'broadcast.specificDepartment': 'ځانګړی څانګه',
    'broadcast.recipientCount': 'ترلاسه کوونکي: {{count}}',
    'broadcast.send': 'ګروپي پیغام لیږل',
    'broadcast.confirm': 'ګروپي پیغام تایید',
    'broadcast.success': 'ګروپي پیغام په بریالیتوب سره ولیږل شو',
    
    // Errors
    'error.loadConversations': 'د خبرو اترو بارول ناکام شو',
    'error.loadMessages': 'د پیغامونو بارول ناکام شو',
    'error.sendMessage': 'د پیغام لیږل ناکام شو',
    'error.uploadFile': 'د فایل اپلوډ ناکام شو',
    'error.fileTooLarge': 'فایل ډیر لوی دی',
    'error.fileTypeNotAllowed': 'د فایل ډول اجازه نلري',
    'error.connectionLost': 'اتصال قطع شو',
    'error.reconnecting': 'بیا وصلېږي...',
  },
};

// ============================================================================
// Hook Interface
// ============================================================================

interface UseLanguageReturn {
  language: Language;
  direction: TextDirection;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing language and translations
 * 
 * @returns Language state, direction, and translation function
 */
export function useLanguage(): UseLanguageReturn {
  const { languageSettings, setLanguage: setLanguageAction } = useMessaging();

  // ============================================================================
  // Translation Function
  // ============================================================================

  /**
   * Translate a key to the current language
   * Supports variable substitution with {{variable}} syntax
   */
  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[languageSettings.language];
    let translation = dict[key] || key;

    // Replace variables if params provided
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{{${paramKey}}}`, String(value));
      });
    }

    return translation;
  }, [languageSettings.language]);

  // ============================================================================
  // Set Language
  // ============================================================================

  /**
   * Change the current language
   * Automatically updates direction and persists to localStorage
   */
  const setLanguage = useCallback((language: Language) => {
    setLanguageAction(language);
  }, [setLanguageAction]);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const isRTL = useMemo(() => {
    return languageSettings.direction === 'rtl';
  }, [languageSettings.direction]);

  // ============================================================================
  // Return hook interface
  // ============================================================================

  return {
    language: languageSettings.language,
    direction: languageSettings.direction,
    setLanguage,
    t,
    isRTL,
  };
}
