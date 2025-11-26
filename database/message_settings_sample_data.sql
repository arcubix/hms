-- Sample Data for Message Settings Tables
-- This file inserts sample data for testing and demonstration

-- ============================================
-- SAMPLE MESSAGE TEMPLATES
-- ============================================

INSERT INTO `message_templates` (`name`, `type`, `trigger_event`, `category`, `content`, `subject`, `is_active`, `sent_count`, `delivery_rate`, `created_by`, `created_at`) VALUES
-- SMS Templates
('Appointment Confirmation SMS', 'sms', 'appointment_booked', 'appointments', 'Dear {patient_name}, your appointment with {doctor_name} is confirmed for {date} at {time}. Please arrive 10 minutes early. Thank you!', NULL, 1, 1250, 98.5, 1, NOW()),
('Appointment Reminder 1 Day', 'sms', 'appointment_reminder_1day', 'appointments', 'Hello {patient_name}, this is a reminder for your appointment tomorrow at {time} with {doctor_name}. Please confirm your attendance.', NULL, 1, 890, 97.2, 1, NOW()),
('Appointment Reminder 2 Hours', 'sms', 'appointment_reminder_2hrs', 'appointments', 'Hi {patient_name}, your appointment with {doctor_name} is in 2 hours at {time}. See you soon!', NULL, 1, 450, 99.1, 1, NOW()),
('OPD Visit Confirmation', 'sms', 'opd_visit', 'opd', 'Dear {patient_name}, your OPD visit on {date} at {time} is confirmed. Token number: {token_number}.', NULL, 1, 320, 96.8, 1, NOW()),
('Lab Results Ready', 'sms', 'lab_results_ready', 'laboratory', 'Dear {patient_name}, your lab test results are ready. Please visit the hospital to collect your reports. Test ID: {test_id}', NULL, 1, 180, 98.9, 1, NOW()),
('Prescription Ready', 'sms', 'prescription_ready', 'pharmacy', 'Hello {patient_name}, your prescription is ready for collection. Prescription ID: {prescription_id}. Please visit the pharmacy.', NULL, 1, 95, 97.5, 1, NOW()),
('Bill Generated', 'sms', 'bill_generated', 'billing', 'Dear {patient_name}, your bill has been generated. Amount: {amount} PKR. Bill Number: {bill_number}. Please proceed to payment counter.', NULL, 1, 210, 98.2, 1, NOW()),
('Discharge Summary', 'sms', 'discharge_summary', 'ipd', 'Dear {patient_name}, your discharge summary is ready. You can collect it from the reception. Thank you for choosing our hospital.', NULL, 1, 75, 99.0, 1, NOW()),
('Follow-up Reminder', 'sms', 'follow_up_reminder', 'appointments', 'Hello {patient_name}, this is a reminder for your follow-up appointment with {doctor_name} on {date} at {time}.', NULL, 1, 120, 97.8, 1, NOW()),

-- Email Templates
('Appointment Confirmation Email', 'email', 'appointment_booked', 'appointments', 'Dear {patient_name},\n\nYour appointment with {doctor_name} has been confirmed.\n\nAppointment Details:\nDate: {date}\nTime: {time}\nDoctor: {doctor_name}\nDepartment: {department}\n\nPlease arrive 10 minutes early for registration.\n\nIf you need to reschedule or cancel, please contact us at least 24 hours in advance.\n\nThank you for choosing our hospital.\n\nBest regards,\nHospital Management System', 'Appointment Confirmation - {date} at {time}', 1, 890, 99.5, 1, NOW()),
('Appointment Reminder Email', 'email', 'appointment_reminder_1day', 'appointments', 'Dear {patient_name},\n\nThis is a friendly reminder about your upcoming appointment.\n\nAppointment Details:\nDate: {date}\nTime: {time}\nDoctor: {doctor_name}\nDepartment: {department}\n\nPlease confirm your attendance by replying to this email or calling us.\n\nWe look forward to seeing you.\n\nBest regards,\nHospital Management System', 'Appointment Reminder - Tomorrow at {time}', 1, 650, 99.2, 1, NOW()),
('Lab Results Ready Email', 'email', 'lab_results_ready', 'laboratory', 'Dear {patient_name},\n\nYour laboratory test results are ready for collection.\n\nTest Details:\nTest ID: {test_id}\nTest Date: {test_date}\nTest Type: {test_type}\n\nYou can collect your reports from the laboratory reception during working hours.\n\nFor any queries, please contact our laboratory department.\n\nBest regards,\nLaboratory Department', 'Lab Test Results Ready - {test_id}', 1, 145, 99.8, 1, NOW()),
('Prescription Ready Email', 'email', 'prescription_ready', 'pharmacy', 'Dear {patient_name},\n\nYour prescription is ready for collection.\n\nPrescription Details:\nPrescription ID: {prescription_id}\nDate: {date}\nDoctor: {doctor_name}\n\nPlease visit the pharmacy to collect your medications.\n\nNote: Please bring a valid ID for verification.\n\nBest regards,\nPharmacy Department', 'Prescription Ready - {prescription_id}', 1, 78, 99.1, 1, NOW()),
('Bill Generated Email', 'email', 'bill_generated', 'billing', 'Dear {patient_name},\n\nYour bill has been generated.\n\nBill Details:\nBill Number: {bill_number}\nDate: {date}\nTotal Amount: {amount} PKR\n\nPlease proceed to the payment counter to complete the payment.\n\nPayment Methods Accepted:\n- Cash\n- Credit/Debit Card\n- Bank Transfer\n\nThank you for your payment.\n\nBest regards,\nBilling Department', 'Bill Generated - {bill_number}', 1, 165, 99.3, 1, NOW()),
('Discharge Summary Email', 'email', 'discharge_summary', 'ipd', 'Dear {patient_name},\n\nYour discharge summary is ready.\n\nDischarge Details:\nDischarge Date: {discharge_date}\nAdmission Date: {admission_date}\nDoctor: {doctor_name}\n\nYou can collect your discharge summary from the reception desk.\n\nPlease follow the post-discharge instructions provided by your doctor.\n\nFor any medical emergencies, please contact our emergency department.\n\nWe wish you a speedy recovery.\n\nBest regards,\nHospital Management System', 'Discharge Summary Ready', 1, 52, 99.6, 1, NOW()),
('Follow-up Reminder Email', 'email', 'follow_up_reminder', 'appointments', 'Dear {patient_name},\n\nThis is a reminder for your follow-up appointment.\n\nAppointment Details:\nDate: {date}\nTime: {time}\nDoctor: {doctor_name}\n\nPlease confirm your attendance.\n\nBest regards,\nHospital Management System', 'Follow-up Appointment Reminder - {date}', 1, 95, 99.0, 1, NOW()),

-- WhatsApp Templates
('Appointment Confirmation WhatsApp', 'whatsapp', 'appointment_booked', 'appointments', '👋 Hello {patient_name}!\n\n✅ Your appointment is confirmed!\n\n📅 Date: {date}\n⏰ Time: {time}\n👨‍⚕️ Doctor: {doctor_name}\n\nPlease arrive 10 minutes early.\n\nThank you! 🙏', NULL, 1, 634, 98.7, 1, NOW()),
('Appointment Reminder WhatsApp', 'whatsapp', 'appointment_reminder_1day', 'appointments', '🔔 Reminder!\n\nHello {patient_name}, you have an appointment tomorrow:\n\n📅 Date: {date}\n⏰ Time: {time}\n👨‍⚕️ Doctor: {doctor_name}\n\nPlease confirm your attendance. Thank you!', NULL, 1, 445, 98.9, 1, NOW()),
('Lab Results Ready WhatsApp', 'whatsapp', 'lab_results_ready', 'laboratory', '📋 Hello {patient_name}!\n\nYour lab test results are ready!\n\n🔬 Test ID: {test_id}\n📅 Test Date: {test_date}\n\nPlease visit the hospital to collect your reports.\n\nThank you!', NULL, 1, 156, 99.2, 1, NOW()),
('Prescription Ready WhatsApp', 'whatsapp', 'prescription_ready', 'pharmacy', '💊 Hello {patient_name}!\n\nYour prescription is ready!\n\n📝 Prescription ID: {prescription_id}\n📅 Date: {date}\n\nPlease visit the pharmacy to collect your medications.\n\nThank you!', NULL, 1, 89, 98.5, 1, NOW()),
('Bill Generated WhatsApp', 'whatsapp', 'bill_generated', 'billing', '💰 Hello {patient_name}!\n\nYour bill has been generated:\n\n📄 Bill Number: {bill_number}\n💵 Amount: {amount} PKR\n📅 Date: {date}\n\nPlease proceed to the payment counter.\n\nThank you!', NULL, 1, 112, 98.8, 1, NOW()),
('Follow-up Reminder WhatsApp', 'whatsapp', 'follow_up_reminder', 'appointments', '🔔 Follow-up Reminder\n\nHello {patient_name}!\n\nYou have a follow-up appointment:\n\n📅 Date: {date}\n⏰ Time: {time}\n👨‍⚕️ Doctor: {doctor_name}\n\nSee you soon!', NULL, 1, 67, 99.1, 1, NOW());

-- ============================================
-- UPDATE PLATFORM SETTINGS (if needed)
-- ============================================
-- Note: Default platform settings are already inserted in schema
-- You can update them with actual provider details:

-- UPDATE `message_platform_settings` SET 
--   `provider_name` = 'Twilio',
--   `api_key` = 'your_api_key',
--   `api_secret` = 'your_api_secret',
--   `sender_id` = 'HOSPITAL',
--   `is_enabled` = 1
-- WHERE `platform` = 'sms';

-- UPDATE `message_platform_settings` SET 
--   `provider_name` = 'SendGrid',
--   `api_key` = 'your_api_key',
--   `sender_email` = 'noreply@hospital.com',
--   `is_enabled` = 1
-- WHERE `platform` = 'email';

-- UPDATE `message_platform_settings` SET 
--   `provider_name` = 'WhatsApp Business API',
--   `api_key` = 'your_api_key',
--   `api_secret` = 'your_api_secret',
--   `is_enabled` = 1
-- WHERE `platform` = 'whatsapp';

-- ============================================
-- SAMPLE MESSAGE RECIPIENTS
-- ============================================
-- Note: These depend on existing users in the users table
-- Adjust user_id values based on your actual user IDs

-- Example: Set recipients for first 5 doctors (assuming they exist)
-- INSERT INTO `message_recipients` (`user_id`, `user_type`, `appointment_sms`, `opd_sms`, `appointment_email`, `schedule_sms`, `schedule_email`, `courtesy_message`, `day_end_report`) VALUES
-- (1, 'doctor', 1, 0, 1, 0, 1, 0, 0),
-- (2, 'doctor', 1, 1, 1, 1, 1, 1, 0),
-- (3, 'doctor', 0, 0, 1, 0, 1, 0, 0),
-- (4, 'doctor', 1, 0, 0, 0, 0, 0, 0),
-- (5, 'doctor', 1, 1, 1, 1, 1, 1, 0)
-- ON DUPLICATE KEY UPDATE 
--   `appointment_sms` = VALUES(`appointment_sms`),
--   `opd_sms` = VALUES(`opd_sms`),
--   `appointment_email` = VALUES(`appointment_email`),
--   `schedule_sms` = VALUES(`schedule_sms`),
--   `schedule_email` = VALUES(`schedule_email`),
--   `courtesy_message` = VALUES(`courtesy_message`),
--   `day_end_report` = VALUES(`day_end_report`);

-- ============================================
-- SAMPLE MESSAGE LOGS (Last 7 days)
-- ============================================

-- Generate sample message logs for the past 7 days
INSERT INTO `message_logs` (`template_id`, `recipient_contact`, `message_type`, `content`, `subject`, `status`, `sent_at`, `delivered_at`, `metadata`, `created_at`) VALUES
-- SMS Logs
(1, '+923001234567', 'sms', 'Dear John Doe, your appointment with Dr. Smith is confirmed for 2024-01-15 at 10:00 AM. Please arrive 10 minutes early. Thank you!', NULL, 'delivered', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), '{"patient_name": "John Doe", "doctor_name": "Dr. Smith", "date": "2024-01-15", "time": "10:00 AM"}', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, '+923001234568', 'sms', 'Hello Jane Smith, this is a reminder for your appointment tomorrow at 02:00 PM with Dr. Johnson. Please confirm your attendance.', NULL, 'delivered', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), '{"patient_name": "Jane Smith", "doctor_name": "Dr. Johnson", "date": "2024-01-16", "time": "02:00 PM"}', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, '+923001234569', 'sms', 'Hi Mike Brown, your appointment with Dr. Williams is in 2 hours at 03:00 PM. See you soon!', NULL, 'delivered', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), '{"patient_name": "Mike Brown", "doctor_name": "Dr. Williams", "time": "03:00 PM"}', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, '+923001234570', 'sms', 'Dear Sarah Davis, your OPD visit on 2024-01-12 at 09:00 AM is confirmed. Token number: T-001.', NULL, 'delivered', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), '{"patient_name": "Sarah Davis", "date": "2024-01-12", "time": "09:00 AM", "token_number": "T-001"}', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, '+923001234571', 'sms', 'Dear Robert Wilson, your lab test results are ready. Please visit the hospital to collect your reports. Test ID: LAB-12345', NULL, 'delivered', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), '{"patient_name": "Robert Wilson", "test_id": "LAB-12345"}', DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Email Logs
(10, 'patient1@example.com', 'email', 'Dear John Doe,\n\nYour appointment with Dr. Smith has been confirmed.\n\nAppointment Details:\nDate: 2024-01-15\nTime: 10:00 AM\nDoctor: Dr. Smith\nDepartment: Cardiology\n\nPlease arrive 10 minutes early for registration.\n\nThank you for choosing our hospital.\n\nBest regards,\nHospital Management System', 'Appointment Confirmation - 2024-01-15 at 10:00 AM', 'delivered', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), '{"patient_name": "John Doe", "doctor_name": "Dr. Smith", "date": "2024-01-15", "time": "10:00 AM", "department": "Cardiology"}', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(11, 'patient2@example.com', 'email', 'Dear Jane Smith,\n\nThis is a friendly reminder about your upcoming appointment.\n\nAppointment Details:\nDate: 2024-01-16\nTime: 02:00 PM\nDoctor: Dr. Johnson\nDepartment: Pediatrics\n\nPlease confirm your attendance.\n\nBest regards,\nHospital Management System', 'Appointment Reminder - Tomorrow at 02:00 PM', 'delivered', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), '{"patient_name": "Jane Smith", "doctor_name": "Dr. Johnson", "date": "2024-01-16", "time": "02:00 PM", "department": "Pediatrics"}', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(12, 'patient3@example.com', 'email', 'Dear Mike Brown,\n\nYour laboratory test results are ready for collection.\n\nTest Details:\nTest ID: LAB-12345\nTest Date: 2024-01-10\nTest Type: Complete Blood Count\n\nYou can collect your reports from the laboratory reception.\n\nBest regards,\nLaboratory Department', 'Lab Test Results Ready - LAB-12345', 'delivered', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), '{"patient_name": "Mike Brown", "test_id": "LAB-12345", "test_date": "2024-01-10", "test_type": "Complete Blood Count"}', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- WhatsApp Logs
(16, '+923001234572', 'whatsapp', '👋 Hello John Doe!\n\n✅ Your appointment is confirmed!\n\n📅 Date: 2024-01-15\n⏰ Time: 10:00 AM\n👨‍⚕️ Doctor: Dr. Smith\n\nPlease arrive 10 minutes early.\n\nThank you! 🙏', NULL, 'delivered', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), '{"patient_name": "John Doe", "doctor_name": "Dr. Smith", "date": "2024-01-15", "time": "10:00 AM"}', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(17, '+923001234573', 'whatsapp', '🔔 Reminder!\n\nHello Jane Smith, you have an appointment tomorrow:\n\n📅 Date: 2024-01-16\n⏰ Time: 02:00 PM\n👨‍⚕️ Doctor: Dr. Johnson\n\nPlease confirm your attendance. Thank you!', NULL, 'delivered', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), '{"patient_name": "Jane Smith", "doctor_name": "Dr. Johnson", "date": "2024-01-16", "time": "02:00 PM"}', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(18, '+923001234574', 'whatsapp', '📋 Hello Mike Brown!\n\nYour lab test results are ready!\n\n🔬 Test ID: LAB-12345\n📅 Test Date: 2024-01-10\n\nPlease visit the hospital to collect your reports.\n\nThank you!', NULL, 'delivered', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), '{"patient_name": "Mike Brown", "test_id": "LAB-12345", "test_date": "2024-01-10"}', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- ============================================
-- UPDATE TEMPLATE STATISTICS
-- ============================================
-- Update sent_count and delivery_rate based on logs
UPDATE `message_templates` mt
SET 
  `sent_count` = (
    SELECT COUNT(*) 
    FROM `message_logs` ml 
    WHERE ml.template_id = mt.id 
    AND ml.status IN ('sent', 'delivered', 'failed')
  ),
  `delivery_rate` = (
    SELECT CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((SUM(CASE WHEN ml.status = 'delivered' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
      ELSE 0
    END
    FROM `message_logs` ml 
    WHERE ml.template_id = mt.id 
    AND ml.status IN ('sent', 'delivered', 'failed')
  ),
  `last_used_at` = (
    SELECT MAX(ml.created_at)
    FROM `message_logs` ml
    WHERE ml.template_id = mt.id
  )
WHERE EXISTS (
  SELECT 1 FROM `message_logs` ml WHERE ml.template_id = mt.id
);

