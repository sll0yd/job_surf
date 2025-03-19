// src/lib/openai-service.ts
import { JobFormData } from './types';

// Define the shape of data we expect from parsing a job URL
export interface ParsedJobData {
  company: string;
  position: string;
  location: string;
  description: string;
  salary?: string;
  requirements?: string[];
  qualifications?: string[];
}

/**
 * Service for interacting with the AI-powered job analysis API
 */
export const aiJobService = {
  /**
   * Extract job details from a URL using AI
   */
  async extractJobFromUrl(url: string): Promise<JobFormData> {
    try {
      // First, fetch the content from the URL
      const response = await fetch('/api/scrape-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { message: string };
        throw new Error(errorData.message || 'Failed to scrape URL');
      }

      const { content } = await response.json() as { content: string };

      // Then, use AI to extract structured job data
      const aiResponse = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, url }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json() as { message: string };
        throw new Error(errorData.message || 'Failed to analyze job content');
      }

      const parsedData = await aiResponse.json() as ParsedJobData;

      // Convert the parsed data to match our JobFormData format
      const jobData: JobFormData = {
        company: parsedData.company || '',
        position: parsedData.position || '',
        location: parsedData.location || '',
        description: parsedData.description || '',
        salary: parsedData.salary || '',
        url: url,
        status: 'saved',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        notes: '',
      };

      // If requirements or qualifications were extracted, add them to notes
      if (parsedData.requirements?.length || parsedData.qualifications?.length) {
        let notes = '';
        
        if (parsedData.requirements?.length) {
          notes += "Requirements:\n" + parsedData.requirements.map(req => `• ${req}`).join('\n') + '\n\n';
        }
        
        if (parsedData.qualifications?.length) {
          notes += "Qualifications:\n" + parsedData.qualifications.map(qual => `• ${qual}`).join('\n');
        }
        
        jobData.notes = notes;
      }

      return jobData;
    } catch (error) {
      console.error('Error extracting job from URL:', error);
      throw error;
    }
  }
};