import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MOCK_CUSTOMERS, MOCK_REGIONS, MOCK_LOCATIONS, RATING_SCALE, CustomerSurvey } from './types';
import { Minus, Plus, Calendar, Map, Building, User, Award, Star, Smile, UserCheck, Shield, Users, Clock, Zap } from 'lucide-react';

type RatingFields = {
  uniformAndAppearance: number;
  professionalism: number;
  customerServiceApproach: number;
  improvedFeelingSecurity: number;
  relationsWithStoreColleagues: number;
  punctualityBreaks: number;
  proactivity: number;
};

const formSchema = z.object({
  officerName: z.string().min(2, 'Officer name is required'),
  date: z.string(),
  customer: z.string(),
  region: z.string(),
  location: z.string(),
  ratings: z.object({
    uniformAndAppearance: z.number().min(1).max(10),
    professionalism: z.number().min(1).max(10),
    customerServiceApproach: z.number().min(1).max(10),
    improvedFeelingSecurity: z.number().min(1).max(10),
    relationsWithStoreColleagues: z.number().min(1).max(10),
    punctualityBreaks: z.number().min(1).max(10),
    proactivity: z.number().min(1).max(10)
  }),
  storeManagerName: z.string().min(2, 'Store manager name is required'),
  areaManagerName: z.string().min(2, 'Area manager name is required'),
  followUpActions: z.array(z.string()),
  datesToBeCompleted: z.array(z.string())
});

interface SurveyFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
  initialData?: CustomerSurvey;
}

// Form section wrapper for consistent styling
const FormSection = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-3 md:mb-4 lg:mb-6 overflow-hidden max-w-full">
    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
      {icon && <span className="text-primary">{icon}</span>}
      {title}
    </h3>
    {children}
  </div>
);

// Rating icon mapping for different categories
const getRatingIcon = (name: keyof RatingFields) => {
  const iconMap = {
    uniformAndAppearance: <User className="h-3.5 w-3.5" />,
    professionalism: <UserCheck className="h-3.5 w-3.5" />,
    customerServiceApproach: <Smile className="h-3.5 w-3.5" />,
    improvedFeelingSecurity: <Shield className="h-3.5 w-3.5" />,
    relationsWithStoreColleagues: <Users className="h-3.5 w-3.5" />,
    punctualityBreaks: <Clock className="h-3.5 w-3.5" />,
    proactivity: <Zap className="h-3.5 w-3.5" />
  };
  return iconMap[name] || <Star className="h-3.5 w-3.5" />;
};

// Component for optimized mobile rating display - horizontal layout
const MobileRatingScale = ({ 
  value, 
  onChange,
  name
}: { 
  value: string; 
  onChange: (value: string) => void;
  name: string;
}) => (
  <div className="flex items-center gap-1 mt-1">
    <div className="grid grid-cols-5 gap-1 w-full">
      {[1, 2, 3, 4, 5].map((score) => (
        <div 
          key={score} 
          className={`flex justify-center items-center h-6 rounded-md text-[10px] font-medium cursor-pointer ${
            parseInt(value) === score 
              ? 'bg-primary/20 text-primary border border-primary' 
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
          onClick={() => onChange(score.toString())}
        >
          {score}
        </div>
      ))}
    </div>
    <div className="grid grid-cols-5 gap-1 w-full">
      {[6, 7, 8, 9, 10].map((score) => (
        <div 
          key={score} 
          className={`flex justify-center items-center h-6 rounded-md text-[10px] font-medium cursor-pointer ${
            parseInt(value) === score 
              ? 'bg-primary/20 text-primary border border-primary' 
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
          onClick={() => onChange(score.toString())}
        >
          {score}
        </div>
      ))}
    </div>
  </div>
);

export const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      officerName: '',
      date: new Date().toISOString().split('T')[0],
      customer: '',
      region: '',
      location: '',
      ratings: {
        uniformAndAppearance: 0,
        professionalism: 0,
        customerServiceApproach: 0,
        improvedFeelingSecurity: 0,
        relationsWithStoreColleagues: 0,
        punctualityBreaks: 0,
        proactivity: 0
      },
      followUpActions: [''],
      datesToBeCompleted: [''],
      storeManagerName: '',
      areaManagerName: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      // Format dates properly for the form
      const formattedData = {
        ...initialData,
        date: initialData.date,
        datesToBeCompleted: initialData.datesToBeCompleted || ['']
      };
      form.reset(formattedData);
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  // Watch the followUpActions and datesToBeCompleted arrays to manage them
  const followUpActions = form.watch('followUpActions');
  const datesToBeCompleted = form.watch('datesToBeCompleted');

  // Add a new empty action field
  const addAction = () => {
    const currentActions = form.getValues('followUpActions');
    form.setValue('followUpActions', [...currentActions, '']);
    form.setValue('datesToBeCompleted', [...form.getValues('datesToBeCompleted'), '']);
  };

  // Remove an action at the specified index
  const removeAction = (index: number) => {
    const currentActions = form.getValues('followUpActions');
    const currentDates = form.getValues('datesToBeCompleted');
    
    if (currentActions.length > 1) {
      form.setValue('followUpActions', currentActions.filter((_, i) => i !== index));
      form.setValue('datesToBeCompleted', currentDates.filter((_, i) => i !== index));
    }
  };

  const renderRatingField = (name: keyof RatingFields, label: string) => (
    <FormField
      control={form.control}
      name={`ratings.${name}`}
      render={({ field }) => (
        <FormItem className="space-y-1 md:space-y-2 mb-3 md:mb-4 lg:mb-5 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700 overflow-hidden">
          <FormLabel className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 truncate">
            {getRatingIcon(name)}
            <span className="truncate">{label}</span>
            {field.value > 0 && (
              <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {field.value}/10
              </span>
            )}
          </FormLabel>
          
          {/* Mobile Rating UI - Only visible on smaller screens */}
          <div className="block sm:hidden">
            <MobileRatingScale 
              value={field.value.toString()} 
              onChange={field.onChange}
              name={name}
            />
            <div className="flex justify-between mt-1 px-1 text-[8px]">
              <span className="text-red-600 dark:text-red-400">Poor</span>
              <span className="text-blue-600 dark:text-blue-400">Excellent</span>
            </div>
          </div>
          
          {/* Desktop Rating UI - Hidden on mobile */}
          <div className="hidden sm:block bg-gray-50 dark:bg-gray-900 p-2 md:p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <RadioGroup
              className="flex justify-between gap-0"
              value={field.value.toString()}
              onValueChange={(value) => field.onChange(parseInt(value))}
            >
              {RATING_SCALE.map((score) => (
                <div key={score} className="flex flex-col items-center">
                  <div className="relative">
                    <RadioGroupItem
                      value={score.toString()}
                      id={`${name}-${score}`}
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 border-2 data-[state=checked]:border-primary data-[state=checked]:text-primary"
                    />
                  </div>
                  <label
                    htmlFor={`${name}-${score}`}
                    className="mt-0.5 md:mt-1 text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {score}
                  </label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between mt-1.5 md:mt-3 px-1 text-[8px] xs:text-[10px] md:text-xs">
              <span className="font-medium text-red-600 dark:text-red-400">Poor</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400 hidden xs:inline">Satisfactory</span>
              <span className="font-medium text-green-600 dark:text-green-400 hidden xs:inline">Good</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">Excellent</span>
            </div>
          </div>
          
          <FormMessage className="text-[10px] xs:text-xs text-red-500" />
        </FormItem>
      )}
    />
  );

  return (
    <div className="w-full max-w-full overflow-hidden min-w-[320px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 md:space-y-4 max-w-full">
          {/* Basic Information Section */}
          <FormSection title="Basic Information" icon={<User className="h-4 w-4 md:h-5 md:w-5" />}>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-4">
              <FormField
                control={form.control}
                name="officerName"
                render={({ field }) => (
                  <FormItem className="col-span-2 xs:col-span-1">
                    <FormLabel className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Officer Name</span>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="h-8 md:h-9 text-xs md:text-sm"
                        placeholder="Enter officer name"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="col-span-2 xs:col-span-1">
                    <FormLabel className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Survey Date</span>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="date" 
                          {...field} 
                          className="h-8 md:h-9 text-xs md:text-sm pl-7 md:pl-9"
                        />
                        <Calendar className="absolute left-2 md:left-3 top-2 md:top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem className="col-span-2 xs:col-span-1">
                    <FormLabel className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span>Customer</span>
                      </div>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 md:h-9 text-xs md:text-sm">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOCK_CUSTOMERS.map((customer) => (
                          <SelectItem key={customer} value={customer} className="text-xs md:text-sm">
                            {customer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem className="col-span-2 xs:col-span-1">
                    <FormLabel className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Map className="h-3 w-3" />
                        <span>Region</span>
                      </div>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 md:h-9 text-xs md:text-sm">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOCK_REGIONS.map((region) => (
                          <SelectItem key={region} value={region} className="text-xs md:text-sm">
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Map className="h-3 w-3" />
                        <span>Location</span>
                      </div>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 md:h-9 text-xs md:text-sm">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOCK_LOCATIONS.map((location) => (
                          <SelectItem key={location} value={location} className="text-xs md:text-sm">
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Performance Ratings Section */}
          <FormSection title="Performance Ratings" icon={<Star className="h-4 w-4 md:h-5 md:w-5" />}>
            <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 md:gap-4 sm:space-y-0">
              {renderRatingField('uniformAndAppearance', 'Uniform and Appearance')}
              {renderRatingField('professionalism', 'Professionalism')}
              {renderRatingField('customerServiceApproach', 'Customer Service')}
              {renderRatingField('improvedFeelingSecurity', 'Security Feeling')}
              {renderRatingField('relationsWithStoreColleagues', 'Store Relations')}
              {renderRatingField('punctualityBreaks', 'Punctuality')}
              {renderRatingField('proactivity', 'Proactivity')}
            </div>
          </FormSection>

          {/* Management Information Section */}
          <FormSection title="Management Information" icon={<Users className="h-4 w-4 md:h-5 md:w-5" />}>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-4">
              <FormField
                control={form.control}
                name="storeManagerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Store Manager</span>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter store manager name"
                        className="h-8 md:h-9 text-xs md:text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="areaManagerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        <span>Area Manager</span>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter area manager name"
                        className="h-8 md:h-9 text-xs md:text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Follow-up Actions Section */}
          <FormSection title="Follow-up Actions" icon={<Clock className="h-4 w-4 md:h-5 md:w-5" />}>
            <div className="space-y-2 md:space-y-3">
              {followUpActions.map((_, index) => (
                <div key={index} className="flex flex-col xs:flex-row gap-2 pb-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`followUpActions.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={`text-[10px] xs:text-xs font-medium ${index !== 0 ? 'sr-only' : ''}`}>
                            Action
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter follow-up action"
                              className="h-8 md:h-9 text-xs md:text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="xs:w-1/3">
                    <FormField
                      control={form.control}
                      name={`datesToBeCompleted.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={`text-[10px] xs:text-xs font-medium ${index !== 0 ? 'sr-only' : ''}`}>
                            Due Date
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              className="h-8 md:h-9 text-xs md:text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex xs:flex-col items-center justify-end">
                    {index === followUpActions.length - 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 md:h-8 md:w-8 mt-[22px] xs:mt-auto"
                        onClick={addAction}
                      >
                        <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 md:h-8 md:w-8 mt-[22px] xs:mt-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeAction(index)}
                      >
                        <Minus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Submit/Cancel Buttons */}
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 xs:justify-end mt-3 md:mt-4 lg:mt-6">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full xs:w-auto order-2 xs:order-1 h-9 md:h-10 text-xs md:text-sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="w-full xs:w-auto order-1 xs:order-2 h-9 md:h-10 text-xs md:text-sm"
            >
              {initialData ? 'Update Survey' : 'Submit Survey'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}; 