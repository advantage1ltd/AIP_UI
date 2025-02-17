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
      followUpActions: ['', '', ''],
      datesToBeCompleted: ['', '', ''],
      storeManagerName: '',
      areaManagerName: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  const renderRatingField = (name: keyof RatingFields, label: string) => (
    <FormField
      control={form.control}
      name={`ratings.${name}`}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-base font-semibold text-gray-900">{label}</FormLabel>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <RadioGroup
              className="flex justify-between gap-1"
              value={field.value.toString()}
              onValueChange={(value) => field.onChange(parseInt(value))}
            >
              {RATING_SCALE.map((score) => (
                <div key={score} className="flex flex-col items-center">
                  <div className="relative">
                    <RadioGroupItem
                      value={score.toString()}
                      id={`${name}-${score}`}
                      className="h-5 w-5 border-2 data-[state=checked]:border-blue-600 data-[state=checked]:text-blue-600"
                    />
                  </div>
                  <label
                    htmlFor={`${name}-${score}`}
                    className="mt-2 text-sm font-medium text-gray-700"
                  >
                    {score}
                  </label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between mt-4 px-2">
              <span className="text-sm font-medium text-red-600">Poor</span>
              <span className="text-sm font-medium text-yellow-600">Satisfactory</span>
              <span className="text-sm font-medium text-green-600">Good</span>
              <span className="text-sm font-medium text-blue-600">Excellent</span>
            </div>
          </div>
          <FormMessage className="text-red-500" />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="officerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Regular Officer Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Customer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_CUSTOMERS.map((customer) => (
                        <SelectItem key={customer} value={customer}>
                          {customer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Region</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_LOCATIONS.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Performance Rating</h2>
          <div className="grid gap-8">
            {renderRatingField('uniformAndAppearance', 'Uniform and Appearance')}
            {renderRatingField('professionalism', 'Professionalism')}
            {renderRatingField('customerServiceApproach', 'Customer Service Approach')}
            {renderRatingField('improvedFeelingSecurity', 'Improved Feeling of Security when Officer on Site')}
            {renderRatingField('relationsWithStoreColleagues', 'Relations With Store Colleagues')}
            {renderRatingField('punctualityBreaks', 'Punctuality / Breaks')}
            {renderRatingField('proactivity', 'Proactivity')}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Management Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="storeManagerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Store Manager Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areaManagerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Area Manager Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Up Actions</h3>
          <div className="space-y-6">
            {[0, 1, 2].map((index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`followUpActions.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Action {index + 1}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`datesToBeCompleted.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Date to be Completed</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="px-6"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Submit Survey
          </Button>
        </div>
      </form>
    </Form>
  );
}; 