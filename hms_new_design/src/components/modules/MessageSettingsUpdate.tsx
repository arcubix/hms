// This is the updated renderMessages function for PreferenceSettings.tsx

const renderMessages = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">Message Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Configure automated message templates for SMS, Email, and WhatsApp</p>
      </div>
      <Button className="bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        Add Template
      </Button>
    </div>

    {/* Platform Configuration Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-green-600" />
            </div>
            <Switch defaultChecked />
          </div>
          <h3 className="font-semibold text-lg mb-1">SMS Messages</h3>
          <p className="text-sm text-gray-600 mb-3">Send automated SMS notifications</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Templates:</span>
              <span className="font-semibold">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sent Today:</span>
              <span className="font-semibold text-green-600">247</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">
            <Settings className="w-3 h-3 mr-2" />
            Configure
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <Switch defaultChecked />
          </div>
          <h3 className="font-semibold text-lg mb-1">Email Messages</h3>
          <p className="text-sm text-gray-600 mb-3">Send automated email notifications</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Templates:</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sent Today:</span>
              <span className="font-semibold text-blue-600">189</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">
            <Settings className="w-3 h-3 mr-2" />
            Configure
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <Switch defaultChecked />
          </div>
          <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
          <p className="text-sm text-gray-600 mb-3">Send automated WhatsApp messages</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Templates:</span>
              <span className="font-semibold">6</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sent Today:</span>
              <span className="font-semibold text-purple-600">156</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">
            <Settings className="w-3 h-3 mr-2" />
            Configure
          </Button>
        </CardContent>
      </Card>
    </div>

    {/* Message Templates with Preview */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Templates List */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Message Templates</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-3 h-3 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockMessages.map((msg) => (
              <div key={msg.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      msg.type === 'sms' ? 'bg-green-100' :
                      msg.type === 'email' ? 'bg-blue-100' :
                      'bg-purple-100'
                    }`}>
                      {msg.type === 'sms' && <Smartphone className="w-5 h-5 text-green-600" />}
                      {msg.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                      {msg.type === 'whatsapp' && <MessageSquare className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{msg.name}</h4>
                      <p className="text-xs text-gray-600">Trigger: {msg.trigger}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={msg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {msg.status}
                    </Badge>
                    <Badge variant="outline" className={
                      msg.type === 'sms' ? 'bg-green-50 text-green-700' :
                      msg.type === 'email' ? 'bg-blue-50 text-blue-700' :
                      'bg-purple-50 text-purple-700'
                    }>
                      {msg.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed">{msg.content}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicate
                  </Button>
                  <Button size="sm" variant="outline">
                    <Send className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 ml-auto">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Message Preview Panel */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-base">WhatsApp Preview</CardTitle>
            <CardDescription>See how your message will appear</CardDescription>
          </CardHeader>
          <CardContent>
            {/* WhatsApp-style Preview */}
            <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="bg-white rounded-lg p-3 shadow-sm mb-2">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Hospital className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">City Hospital</p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {/* Incoming message */}
                  <div className="bg-white border rounded-lg rounded-tl-none p-3 shadow-sm">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Hello {'{patient_name}'}, this is a reminder for your appointment tomorrow at {'{time}'} with {'{doctor_name}'}.
                    </p>
                    <p className="text-xs text-gray-400 mt-2 text-right">12:53 PM</p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-3">
                <p className="text-xs text-gray-600">🔒 End-to-end encrypted</p>
              </div>
            </div>

            {/* SMS Preview */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-4 h-4 text-green-600" />
                <p className="font-semibold text-sm">SMS Preview</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-500 mb-2">From: HOSPITAL</p>
                <p className="text-sm text-gray-700">
                  Dear {'{patient_name}'}, your appointment with {'{doctor_name}'} is confirmed for {'{date}'} at {'{time}'}. Thank you!
                </p>
              </div>
            </div>

            {/* Email Preview */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <p className="font-semibold text-sm">Email Preview</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-500 mb-1">Subject: Lab Results Ready</p>
                <Separator className="my-2" />
                <p className="text-sm text-gray-700">
                  Dear {'{patient_name}'}, your lab results are ready. Please visit the hospital to collect your reports.
                </p>
              </div>
            </div>

            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Send Test Message
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Variables and Triggers */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            Available Variables
          </CardTitle>
          <CardDescription>Use these variables in your message templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { var: '{patient_name}', desc: 'Patient full name' },
              { var: '{doctor_name}', desc: 'Doctor name' },
              { var: '{date}', desc: 'Appointment date' },
              { var: '{time}', desc: 'Appointment time' },
              { var: '{hospital_name}', desc: 'Hospital name' },
              { var: '{department}', desc: 'Department name' },
              { var: '{bill_amount}', desc: 'Bill amount' },
              { var: '{appointment_id}', desc: 'Appointment ID' },
              { var: '{patient_id}', desc: 'Patient ID/UHID' },
              { var: '{contact}', desc: 'Patient contact' },
              { var: '{doctor_dept}', desc: 'Doctor department' },
              { var: '{room_number}', desc: 'Room/Bed number' }
            ].map((item) => (
              <div key={item.var} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                <p className="font-mono text-xs text-blue-600 mb-1">{item.var}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-600" />
            Message Triggers
          </CardTitle>
          <CardDescription>Automated message triggers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Appointment Booked', count: 3, icon: Calendar, color: 'blue' },
              { name: 'Appointment Reminder (1 day)', count: 2, icon: Clock, color: 'orange' },
              { name: 'Appointment Reminder (2 hours)', count: 1, icon: AlertCircle, color: 'red' },
              { name: 'Lab Results Ready', count: 1, icon: FlaskConical, color: 'green' },
              { name: 'Prescription Ready', count: 1, icon: Pill, color: 'purple' },
              { name: 'Bill Generated', count: 2, icon: DollarSign, color: 'yellow' },
              { name: 'Discharge Summary', count: 1, icon: FileText, color: 'gray' },
              { name: 'Follow-up Reminder', count: 1, icon: Calendar, color: 'teal' }
            ].map((trigger) => {
              const Icon = trigger.icon;
              return (
                <div key={trigger.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${trigger.color}-100 flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 text-${trigger.color}-600`} />
                    </div>
                    <span className="text-sm font-medium">{trigger.name}</span>
                  </div>
                  <Badge variant="outline">{trigger.count} template{trigger.count > 1 ? 's' : ''}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Messaging Statistics */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-green-600" />
          Messaging Statistics (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <Smartphone className="w-6 h-6 text-green-600" />
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">1,247</p>
            <p className="text-sm text-gray-600">SMS Sent</p>
            <p className="text-xs text-green-600 mt-1">+12% from last week</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-6 h-6 text-blue-600" />
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">892</p>
            <p className="text-sm text-gray-600">Emails Sent</p>
            <p className="text-xs text-blue-600 mt-1">+8% from last week</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">634</p>
            <p className="text-sm text-gray-600">WhatsApp Sent</p>
            <p className="text-xs text-purple-600 mt-1">+15% from last week</p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-800">98%</Badge>
            </div>
            <p className="text-2xl font-bold text-orange-900">2,712</p>
            <p className="text-sm text-gray-600">Delivery Rate</p>
            <p className="text-xs text-orange-600 mt-1">Total messages delivered</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
