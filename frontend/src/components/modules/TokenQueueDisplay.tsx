import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Phone, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { api, Token, Reception, Floor } from '../../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TokenQueueDisplayProps {
  receptionId?: number;
  onTokenUpdate?: () => void;
}

export function TokenQueueDisplay({ receptionId, onTokenUpdate }: TokenQueueDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedReception, setSelectedReception] = useState<number | null>(receptionId || null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tokens, setTokens] = useState<Token[]>([]);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  useEffect(() => {
    loadReceptions();
    loadFloors();
  }, []);

  useEffect(() => {
    if (selectedReception) {
      loadQueue();
    }
  }, [selectedReception, selectedDate]);

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (selectedReception) {
        loadQueue();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedReception, selectedDate]);

  const loadReceptions = async () => {
    try {
      const data = await api.getReceptions({ status: 'Active' });
      setReceptions(data);
      if (!selectedReception && data.length > 0) {
        setSelectedReception(data[0].id);
      }
    } catch (error: any) {
      console.error('Error loading receptions:', error);
    }
  };

  const loadFloors = async () => {
    try {
      const data = await api.getFloors({ status: 'Active' });
      setFloors(data);
    } catch (error: any) {
      console.error('Error loading floors:', error);
    }
  };

  const loadQueue = async () => {
    if (!selectedReception) return;

    try {
      setLoading(true);
      const data = await api.getTokenQueue(selectedReception, selectedDate);
      setTokens(data);
    } catch (error: any) {
      console.error('Error loading queue:', error);
      toast.error('Failed to load token queue');
    } finally {
      setLoading(false);
    }
  };

  const handleCallToken = async (tokenId: number) => {
    try {
      setUpdating(true);
      await api.updateTokenStatus(tokenId, 'In Progress');
      toast.success('Token called');
      loadQueue();
      onTokenUpdate?.();
    } catch (error: any) {
      console.error('Error calling token:', error);
      toast.error('Failed to call token');
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteToken = async (tokenId: number) => {
    try {
      setUpdating(true);
      await api.updateTokenStatus(tokenId, 'Completed');
      toast.success('Token marked as completed');
      loadQueue();
      onTokenUpdate?.();
    } catch (error: any) {
      console.error('Error completing token:', error);
      toast.error('Failed to complete token');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelToken = async (tokenId: number) => {
    if (!confirm('Are you sure you want to cancel this token?')) {
      return;
    }

    try {
      setUpdating(true);
      await api.updateTokenStatus(tokenId, 'Cancelled');
      toast.success('Token cancelled');
      loadQueue();
      onTokenUpdate?.();
    } catch (error: any) {
      console.error('Error cancelling token:', error);
      toast.error('Failed to cancel token');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Waiting':
        return <Clock className="w-4 h-4" />;
      case 'In Progress':
        return <Phone className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const waitingTokens = tokens.filter(t => t.status === 'Waiting').sort((a, b) => 
    a.token_number.localeCompare(b.token_number)
  );
  const inProgressTokens = tokens.filter(t => t.status === 'In Progress');
  const completedTokens = tokens.filter(t => t.status === 'Completed').slice(0, 10);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Token Queue Display</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and monitor token queue</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadQueue} disabled={loading || updating}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading || updating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Select
            value={selectedReception?.toString() || ''}
            onValueChange={(value) => setSelectedReception(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select reception" />
            </SelectTrigger>
            <SelectContent>
              {receptions.map(reception => (
                <SelectItem key={reception.id} value={reception.id.toString()}>
                  {reception.reception_name} (Floor {reception.floor_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Waiting Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Waiting</span>
                <Badge variant="secondary">{waitingTokens.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {waitingTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No tokens waiting
                </div>
              ) : (
                waitingTokens.map(token => (
                  <Card key={token.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-yellow-700">
                          {token.token_number}
                        </div>
                        <Badge className={getStatusColor(token.status)}>
                          {getStatusIcon(token.status)}
                          <span className="ml-1">{token.status}</span>
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">{token.patient_name}</div>
                        <div className="text-gray-600">Dr. {token.doctor_name}</div>
                        <div className="text-gray-600">Room: {token.room_number}</div>
                        <div className="text-gray-500">
                          {format(new Date(token.appointment_date || ''), 'hh:mm a')}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleCallToken(token.id)}
                          disabled={updating}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>In Progress</span>
                <Badge variant="secondary">{inProgressTokens.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {inProgressTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No tokens in progress
                </div>
              ) : (
                inProgressTokens.map(token => (
                  <Card key={token.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-blue-700">
                          {token.token_number}
                        </div>
                        <Badge className={getStatusColor(token.status)}>
                          {getStatusIcon(token.status)}
                          <span className="ml-1">{token.status}</span>
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">{token.patient_name}</div>
                        <div className="text-gray-600">Dr. {token.doctor_name}</div>
                        <div className="text-gray-600">Room: {token.room_number}</div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleCompleteToken(token.id)}
                          disabled={updating}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelToken(token.id)}
                          disabled={updating}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Completed (Recent) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Completed (Recent)</span>
                <Badge variant="secondary">{completedTokens.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {completedTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No completed tokens
                </div>
              ) : (
                completedTokens.map(token => (
                  <Card key={token.id} className="border-l-4 border-l-green-500 opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xl font-bold text-green-700">
                          {token.token_number}
                        </div>
                        <Badge className={getStatusColor(token.status)}>
                          {getStatusIcon(token.status)}
                          <span className="ml-1">{token.status}</span>
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">{token.patient_name}</div>
                        <div className="text-gray-600">Dr. {token.doctor_name}</div>
                        {token.completed_at && (
                          <div className="text-gray-500 text-xs">
                            Completed: {format(new Date(token.completed_at), 'hh:mm a')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

