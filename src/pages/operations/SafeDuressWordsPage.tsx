import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Radio, 
  Users, 
  Lock,
  History,
  KeyRound,
  Calendar,
  User
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface CodeWord {
  word: string;
  updatedAt: string;
  updatedBy: string;
}

interface WordHistory {
  id: string;
  type: 'safe' | 'duress';
  oldWord: string;
  newWord: string;
  changedAt: string;
  changedBy: string;
  reason: string;
}

const SafeDuressWordsPage: React.FC = () => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [updateType, setUpdateType] = useState<'safe' | 'duress' | null>(null);
  const [newWord, setNewWord] = useState('');
  const [reason, setReason] = useState('');
  const [authorizedCode, setAuthorizedCode] = useState('');

  // Mock current words with last update info
  const [currentWords, setCurrentWords] = useState<{
    safe: CodeWord;
    duress: CodeWord;
  }>({
    safe: {
      word: 'cat',
      updatedAt: '2024-02-15',
      updatedBy: 'John Smith'
    },
    duress: {
      word: 'dog',
      updatedAt: '2024-02-15',
      updatedBy: 'John Smith'
    }
  });

  // Mock word change history
  const [wordHistory] = useState<WordHistory[]>([
    {
      id: '1',
      type: 'safe',
      oldWord: 'bird',
      newWord: 'cat',
      changedAt: '2024-02-15 09:00',
      changedBy: 'John Smith',
      reason: 'Quarterly security protocol update'
    },
    {
      id: '2',
      type: 'duress',
      oldWord: 'fish',
      newWord: 'dog',
      changedAt: '2024-02-15 09:00',
      changedBy: 'John Smith',
      reason: 'Quarterly security protocol update'
    }
  ]);

  const handleUpdateWord = () => {
    if (!updateType || !newWord || !reason || !authorizedCode) return;
    
    // In a real application, you would:
    // 1. Validate the authorization code
    // 2. Make an API call to update the word
    // 3. Log the change in a secure database
    // 4. Notify relevant personnel

    const currentDate = new Date().toISOString().split('T')[0];
    
    setCurrentWords(prev => ({
      ...prev,
      [updateType]: {
        word: newWord,
        updatedAt: currentDate,
        updatedBy: 'Current User' // This would come from auth context
      }
    }));

    // Reset form
    setNewWord('');
    setReason('');
    setAuthorizedCode('');
    setShowUpdateDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Safe and Duress Words</h1>
              <p className="text-gray-500">Secure communication protocols for security personnel</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowHistory(true)}
            >
              <History className="w-4 h-4" />
              View History
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              onClick={() => setShowUpdateDialog(true)}
            >
              <KeyRound className="w-4 h-4" />
              Update Words
            </Button>
          </div>
        </div>

        {/* Important Notice */}
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-600 font-semibold">Confidential Information</AlertTitle>
          <AlertDescription className="text-red-700">
            This information is strictly confidential and should only be shared with authorized security personnel.
            Memorize these words and never write them down or store them digitally outside secure systems.
          </AlertDescription>
        </Alert>

        {/* Current Words Card */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Safe Word
              </CardTitle>
              <CardDescription className="text-green-700">Use to indicate all clear/no threat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <span className="text-2xl font-bold text-green-700">{currentWords.safe.word}</span>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-green-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last updated: {currentWords.safe.updatedAt} by {currentWords.safe.updatedBy}
              </div>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Duress Word
              </CardTitle>
              <CardDescription className="text-red-700">Use to indicate danger/threat present</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <span className="text-2xl font-bold text-red-700">{currentWords.duress.word}</span>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-red-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last updated: {currentWords.duress.updatedAt} by {currentWords.duress.updatedBy}
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Guidelines Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Usage Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Radio className="h-4 w-4 text-blue-600" />
                  Communication Protocols
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="rounded-full h-1.5 w-1.5 bg-blue-600 mt-2 flex-shrink-0" />
                    Use these words naturally in conversation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full h-1.5 w-1.5 bg-blue-600 mt-2 flex-shrink-0" />
                    Incorporate into regular radio checks
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full h-1.5 w-1.5 bg-blue-600 mt-2 flex-shrink-0" />
                    Maintain normal tone of voice
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Team Response
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="rounded-full h-1.5 w-1.5 bg-blue-600 mt-2 flex-shrink-0" />
                    Acknowledge receipt without repeating the word
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full h-1.5 w-1.5 bg-blue-600 mt-2 flex-shrink-0" />
                    Follow established response procedures
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full h-1.5 w-1.5 bg-blue-600 mt-2 flex-shrink-0" />
                    Maintain situational awareness
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              Secure Communication Examples
            </CardTitle>
            <CardDescription>
              Examples of how to naturally incorporate code words into conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Example Usage</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Regular Check</TableCell>
                  <TableCell>"Just saw a cat near the loading bay, all quiet here."</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Safe Word</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Suspicious Activity</TableCell>
                  <TableCell>"There's a dog barking outside, can you check CCTV?"</TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Duress Word</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">End of Shift</TableCell>
                  <TableCell>"Just like my cat at home, everything's peaceful here."</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Safe Word</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Potential Threat</TableCell>
                  <TableCell>"That dog from yesterday is back, might need backup."</TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Duress Word</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Update Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Code Word</DialogTitle>
              <DialogDescription>
                Enter the new code word and provide authorization. This action will be logged.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Select Type</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={updateType === 'safe' ? 'default' : 'outline'}
                    className={updateType === 'safe' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => setUpdateType('safe')}
                  >
                    Safe Word
                  </Button>
                  <Button
                    type="button"
                    variant={updateType === 'duress' ? 'default' : 'outline'}
                    className={updateType === 'duress' ? 'bg-red-600 hover:bg-red-700' : ''}
                    onClick={() => setUpdateType('duress')}
                  >
                    Duress Word
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>New Word</Label>
                <Input
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Enter new code word"
                />
              </div>
              <div className="grid gap-2">
                <Label>Reason for Change</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for change"
                />
              </div>
              <div className="grid gap-2">
                <Label>Authorization Code</Label>
                <Input
                  type="password"
                  value={authorizedCode}
                  onChange={(e) => setAuthorizedCode(e.target.value)}
                  placeholder="Enter authorization code"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateWord}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!updateType || !newWord || !reason || !authorizedCode}
              >
                Update Word
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
            <DialogHeader className="space-y-4 pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <History className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Code Word Change History</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Comprehensive record of all security word modifications
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="py-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="bg-gray-50">
                  <CardHeader className="py-4 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-500">Total Changes</CardTitle>
                      <History className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="text-2xl font-bold text-gray-900">{wordHistory.length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardHeader className="py-4 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-green-600">Safe Word Changes</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="text-2xl font-bold text-green-700">
                      {wordHistory.filter(h => h.type === 'safe').length}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50">
                  <CardHeader className="py-4 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-red-600">Duress Word Changes</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="text-2xl font-bold text-red-700">
                      {wordHistory.filter(h => h.type === 'duress').length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-lg border bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-[180px] font-semibold">Date & Time</TableHead>
                      <TableHead className="w-[120px] font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Word Change</TableHead>
                      <TableHead className="font-semibold">Changed By</TableHead>
                      <TableHead className="font-semibold">Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wordHistory.map((history) => (
                      <TableRow 
                        key={history.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {history.changedAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={cn(
                              "px-2 py-1 font-medium",
                              history.type === 'safe' 
                                ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                                : 'bg-red-100 text-red-700 hover:bg-red-100'
                            )}
                          >
                            {history.type === 'safe' ? 'Safe Word' : 'Duress Word'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{history.oldWord}</span>
                            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span className="font-medium text-gray-900">{history.newWord}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className="text-gray-900">{history.changedBy}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span className="text-gray-600 line-clamp-2">{history.reason}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {wordHistory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <History className="h-8 w-8 text-gray-400" />
                            <p className="text-gray-500 text-sm">No change history available</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default SafeDuressWordsPage;
