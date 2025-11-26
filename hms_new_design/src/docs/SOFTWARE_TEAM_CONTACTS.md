# Software Team Contacts - Documentation

## Overview
The Software Team Contacts page provides comprehensive customer service and technical support contact information for the Hospital Management System. This feature allows users to easily connect with the software development and support team for assistance.

## Features

### 1. **Team Directory**
Complete directory of support team members with:
- **6 Support Professionals** across different departments
- **Real-time Availability Status** (Available, Busy, Offline)
- **Contact Information** (Email, Phone)
- **Expertise Areas** for each team member
- **Response Time Estimates**
- **Social Media Links** (LinkedIn, GitHub)
- **Department Filtering**

### 2. **Support Channels**
Four primary support channels:

#### Email Support
- **Contact:** support@hmstech.com
- **Availability:** 24/7
- **Response Time:** < 24 hours
- **Best For:** Detailed queries, non-urgent issues

#### Phone Support
- **Contact:** +1 (555) 100-HELP
- **Availability:** Mon-Fri, 8 AM - 8 PM EST
- **Response Time:** Immediate
- **Best For:** Urgent issues, verbal communication

#### Live Chat
- **Location:** In-app
- **Availability:** Mon-Fri, 9 AM - 6 PM EST
- **Response Time:** < 5 minutes
- **Best For:** Quick questions, real-time assistance

#### Emergency Hotline
- **Contact:** +1 (555) 911-TECH
- **Availability:** 24/7/365
- **Response Time:** < 15 minutes
- **Best For:** Critical system issues only

### 3. **Contact Form**
Comprehensive support request form with:
- Full Name and Email
- Subject and Priority Level
- Detailed Message
- Priority Options:
  - Low - General inquiry
  - Normal - Standard support
  - High - Important issue
  - Urgent - Critical problem

### 4. **Self-Service Resources**
Quick access to:
- **Knowledge Base** - 500+ articles
- **Video Tutorials** - 100+ videos
- **API Documentation** - Developer docs
- **System Status** - Real-time status
- **Release Notes** - Latest updates
- **Community Forum** - Join discussions

### 5. **FAQ Section**
Frequently asked questions with instant answers:
- Password reset procedures
- Support hours information
- Feature request process
- Training availability

## Team Members

### Michael Chen - Lead Support Engineer
- **Department:** Customer Success
- **Email:** michael.chen@hmstech.com
- **Phone:** +1 (555) 0123
- **Availability:** Mon-Fri, 9 AM - 6 PM EST
- **Response Time:** < 2 hours
- **Expertise:** Technical Support, System Integration, Troubleshooting

### Sarah Williams - Senior Customer Support Specialist
- **Department:** Customer Success
- **Email:** sarah.williams@hmstech.com
- **Phone:** +1 (555) 0124
- **Availability:** Mon-Fri, 8 AM - 5 PM EST
- **Response Time:** < 1 hour
- **Expertise:** User Training, Account Management, Billing Support

### David Rodriguez - Technical Support Manager
- **Department:** Engineering
- **Email:** david.rodriguez@hmstech.com
- **Phone:** +1 (555) 0125
- **Availability:** Mon-Fri, 10 AM - 7 PM EST
- **Response Time:** < 4 hours
- **Expertise:** Bug Reports, Feature Requests, System Architecture

### Emily Thompson - Implementation Specialist
- **Department:** Professional Services
- **Email:** emily.thompson@hmstech.com
- **Phone:** +1 (555) 0126
- **Availability:** Mon-Fri, 9 AM - 6 PM EST
- **Response Time:** < 3 hours
- **Expertise:** System Setup, Data Migration, Custom Configuration

### James Park - DevOps Engineer
- **Department:** Engineering
- **Email:** james.park@hmstech.com
- **Phone:** +1 (555) 0127
- **Availability:** 24/7 Emergency Support
- **Response Time:** < 30 mins (Critical)
- **Expertise:** Server Issues, Performance, Security

### Lisa Anderson - Product Support Lead
- **Department:** Product
- **Email:** lisa.anderson@hmstech.com
- **Phone:** +1 (555) 0128
- **Availability:** Mon-Fri, 8 AM - 5 PM EST
- **Response Time:** < 2 hours
- **Expertise:** Product Training, Feature Guidance, Best Practices

## Access Points

### Option 1: From System Settings
1. Login to HMS
2. Navigate to **Settings** (gear icon)
3. Select **Contacts** from the settings menu

### Option 2: Direct Component Import
```tsx
import { SoftwareTeamContacts } from './components/settings/SoftwareTeamContacts';

function MyPage() {
  return <SoftwareTeamContacts />;
}
```

### Option 3: Standalone Page
```tsx
import { ContactsPage } from './components/pages/ContactsPage';
```

## Features in Detail

### Quick Stats Dashboard
- **Average Response Time:** 2.5 hours
- **Team Members:** 6 professionals
- **Support Channels:** 4 options
- **Satisfaction Rate:** 98%

### Department Filtering
Filter team members by department:
- All Teams
- Customer Success
- Engineering
- Professional Services
- Product

### Copy to Clipboard
- One-click email copying
- Phone number copying
- Visual feedback on copy

### Real-time Status Indicators
- 🟢 Available - Ready to assist
- 🟡 Busy - May have delayed response
- ⚫ Offline - Not currently available

### Interactive Contact Cards
Each team member card includes:
- Avatar with fallback initials
- Name and role
- Department badge
- Status indicator
- Email address (with copy)
- Phone number
- Availability hours
- Response time estimate
- Expertise tags
- Direct action buttons (Email, Call, LinkedIn, GitHub)

## Business Hours

| Day | Hours | Status |
|-----|-------|--------|
| Monday - Friday | 8 AM - 8 PM EST | Standard Support |
| Saturday | 10 AM - 4 PM EST | Limited Support |
| Sunday | Closed | Emergency Only |
| Emergency | 24/7/365 | Critical Issues |

## Service Level Agreement (SLA)

✅ **99.9% Uptime Guarantee**
✅ **24/7 Critical Support**
✅ **Dedicated Account Manager**

## Contact Information

### Headquarters
123 Healthcare Technology Drive
San Francisco, CA 94105
United States

### Online Resources
- Website: www.hmstech.com
- Support Portal: support.hmstech.com
- Status Page: status.hmstech.com

### Email Departments
- General: support@hmstech.com
- Sales: sales@hmstech.com
- Billing: billing@hmstech.com

## Design Features

### Color Scheme
- Blue (#2F80ED) - Primary actions
- Green (#27AE60) - Success/Available
- Red - Emergency/Critical
- Purple - Live Chat
- Orange - Satisfaction metrics

### Responsive Design
- Mobile-friendly layout
- Grid adapts to screen size
- Touch-friendly buttons
- Optimized for all devices

### Accessibility
- Screen reader support
- Keyboard navigation
- High contrast ratios
- Clear focus indicators

## Use Cases

1. **Technical Issues**
   - Contact: Michael Chen or David Rodriguez
   - Channel: Phone or Email
   - Expected Response: 2-4 hours

2. **Training Requests**
   - Contact: Sarah Williams or Emily Thompson
   - Channel: Email or Contact Form
   - Expected Response: 1-3 hours

3. **Emergency Support**
   - Contact: James Park (Emergency Hotline)
   - Channel: Emergency Phone Line
   - Expected Response: < 30 minutes

4. **Feature Requests**
   - Contact: David Rodriguez or Lisa Anderson
   - Channel: Contact Form
   - Expected Response: 4-24 hours

5. **Billing Questions**
   - Contact: Sarah Williams
   - Channel: Email (billing@hmstech.com)
   - Expected Response: 1-2 hours

## Integration

The component is fully integrated with:
- System Settings Module
- Toast notifications for feedback
- Clipboard API for copy functionality
- Form validation
- Responsive grid system

## Future Enhancements

Potential future features:
- Real-time chat integration
- Video call scheduling
- Ticket tracking system
- Knowledge base search
- AI-powered chatbot
- Multi-language support
- SMS notifications
- Calendar integration for scheduling

## Support

For questions about the Contacts feature itself:
- Email: support@hmstech.com
- Phone: +1 (555) 100-HELP
- Emergency: +1 (555) 911-TECH
