import admin from "firebase-admin";

/**
 * Firebase Cloud Messaging (FCM) Integration
 * 
 * يوفر نظام إشعارات Push للمستخدمين عبر Firebase
 * 
 * للاستخدام:
 * 1. أنشئ مشروع Firebase على https://console.firebase.google.com
 * 2. اذهب إلى Project Settings → Service Accounts
 * 3. انقر "Generate new private key" وحمّل ملف JSON
 * 4. أضف محتوى الملف كـ environment variable: FIREBASE_SERVICE_ACCOUNT
 */

let fcmInitialized = false;

/**
 * تهيئة Firebase Admin SDK
 */
export function initializeFCM() {
  if (fcmInitialized) {
    return;
  }

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccount) {
      console.warn('[FCM] FIREBASE_SERVICE_ACCOUNT not configured. Push notifications disabled.');
      return;
    }

    const credentials = JSON.parse(serviceAccount);

    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });

    fcmInitialized = true;
    console.log('[FCM] Firebase Cloud Messaging initialized successfully');
  } catch (error) {
    console.error('[FCM] Failed to initialize Firebase:', error);
  }
}

/**
 * إرسال إشعار لجهاز واحد
 */
export async function sendNotificationToDevice(
  token: string,
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<boolean> {
  if (!fcmInitialized) {
    console.warn('[FCM] Cannot send notification: FCM not initialized');
    return false;
  }

  try {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'manga_updates',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('[FCM] Notification sent successfully:', response);
    return true;
  } catch (error) {
    console.error('[FCM] Error sending notification:', error);
    return false;
  }
}

/**
 * إرسال إشعار لعدة أجهزة
 */
export async function sendNotificationToDevices(
  tokens: string[],
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number }> {
  if (!fcmInitialized) {
    console.warn('[FCM] Cannot send notifications: FCM not initialized');
    return { successCount: 0, failureCount: tokens.length };
  }

  try {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'manga_updates',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`[FCM] Sent ${response.successCount} notifications successfully`);
    
    if (response.failureCount > 0) {
      console.warn(`[FCM] ${response.failureCount} notifications failed`);
    }

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('[FCM] Error sending notifications:', error);
    return { successCount: 0, failureCount: tokens.length };
  }
}

/**
 * إرسال إشعار لموضوع (Topic)
 */
export async function sendNotificationToTopic(
  topic: string,
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<boolean> {
  if (!fcmInitialized) {
    console.warn('[FCM] Cannot send notification: FCM not initialized');
    return false;
  }

  try {
    const message: admin.messaging.Message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'manga_updates',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('[FCM] Topic notification sent successfully:', response);
    return true;
  } catch (error) {
    console.error('[FCM] Error sending topic notification:', error);
    return false;
  }
}

/**
 * الاشتراك في موضوع
 */
export async function subscribeToTopic(
  tokens: string[],
  topic: string
): Promise<{ successCount: number; failureCount: number }> {
  if (!fcmInitialized) {
    console.warn('[FCM] Cannot subscribe: FCM not initialized');
    return { successCount: 0, failureCount: tokens.length };
  }

  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    console.log(`[FCM] Subscribed ${response.successCount} devices to topic: ${topic}`);
    
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('[FCM] Error subscribing to topic:', error);
    return { successCount: 0, failureCount: tokens.length };
  }
}

/**
 * إلغاء الاشتراك من موضوع
 */
export async function unsubscribeFromTopic(
  tokens: string[],
  topic: string
): Promise<{ successCount: number; failureCount: number }> {
  if (!fcmInitialized) {
    console.warn('[FCM] Cannot unsubscribe: FCM not initialized');
    return { successCount: 0, failureCount: tokens.length };
  }

  try {
    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
    console.log(`[FCM] Unsubscribed ${response.successCount} devices from topic: ${topic}`);
    
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('[FCM] Error unsubscribing from topic:', error);
    return { successCount: 0, failureCount: tokens.length };
  }
}

// تهيئة FCM عند بدء التطبيق
initializeFCM();
