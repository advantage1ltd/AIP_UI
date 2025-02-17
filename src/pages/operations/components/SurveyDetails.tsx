import React from 'react';
import { CustomerSurvey, getRatingLabel } from './types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, MapPin, Building2, User } from 'lucide-react';

interface SurveyDetailsProps {
  survey: CustomerSurvey;
  open: boolean;
  onClose: () => void;
}

export const SurveyDetails: React.FC<SurveyDetailsProps> = ({ survey, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Survey Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span className="font-medium">Officer:</span>
                <span>{survey.officerName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Date:</span>
                <span>{new Date(survey.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Customer:</span>
                <span>{survey.customer}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Location:</span>
                <span>{survey.location}, {survey.region}</span>
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Ratings</h3>
            <div className="grid gap-4">
              {Object.entries(survey.ratings).map(([key, score]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <span className="font-medium text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      score <= 3 ? 'bg-red-100 text-red-700' :
                      score <= 6 ? 'bg-yellow-100 text-yellow-700' :
                      score <= 8 ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {getRatingLabel(score)}
                    </span>
                    <span className="text-gray-900 font-bold">{score}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Management Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Management Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Store Manager</span>
                <p className="text-gray-900">{survey.storeManagerName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Area Manager</span>
                <p className="text-gray-900">{survey.areaManagerName}</p>
              </div>
            </div>
          </div>

          {/* Follow-up Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Follow-up Actions</h3>
            <div className="space-y-4">
              {survey.followUpActions.map((action, index) => (
                action && (
                  <div key={index} className="flex items-start justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-1">
                      <span className="font-medium text-gray-900">Action {index + 1}</span>
                      <p className="text-gray-600">{action}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-500">Due Date</span>
                      <p className="text-gray-900">{new Date(survey.datesToBeCompleted[index]).toLocaleDateString()}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 