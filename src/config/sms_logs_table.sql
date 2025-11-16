-- SMS Logs Table
-- Tracks all SMS sent from the system

CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  blood_request_id UUID REFERENCES blood_requests(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, sent, failed, delivered
  provider VARCHAR(50), -- twilio, africastalking
  provider_message_id VARCHAR(255), -- ID from SMS provider
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_sms_logs_user_id ON sms_logs(user_id);
CREATE INDEX idx_sms_logs_blood_request_id ON sms_logs(blood_request_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at DESC);

-- Comments
COMMENT ON TABLE sms_logs IS 'Tracks all SMS messages sent from the system';
COMMENT ON COLUMN sms_logs.status IS 'Status: pending, sent, failed, delivered';
COMMENT ON COLUMN sms_logs.provider_message_id IS 'Message ID from SMS provider for tracking';
