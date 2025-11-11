-- جدول FCM Tokens لحفظ رموز الأجهزة
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  device_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token)
);

-- جدول الإشعارات المرسلة
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  image_url VARCHAR(500),
  data JSON,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  manga_id INT,
  chapter_id INT,
  INDEX idx_user_id (user_id),
  INDEX idx_sent_at (sent_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
