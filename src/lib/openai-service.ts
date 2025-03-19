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
 * Service for interacting with OpenAI API
 */
export const openAIService = {
  /**
   * Extract job details from a URL using OpenAI
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to scrape URL');
      }

      const { content } = await response.json();

      // Then, use OpenAI to extract structured job data
      const aiResponse = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, url }),
      });

      if (!aiResponse.ok) {
        const error = await aiResponse.json();
        throw new Error(error.message || 'Failed to analyze job content');
      }

      const parsedData = await aiResponse.json();

      // Convert the parsed data to match our JobFormData format
      // Make sure all the required fields are filled with at least empty strings to match the type
      return {
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
        notes: parsedData.requirements ? 
          `Requirements:\n${parsedData.requirements.join('\n')}\n\nQualifications:\n${parsedData.qualifications?.join('\n') || ''}` : '',
        applied_date: '',
      };
    } catch (error) {
      console.error('Error extracting job from URL:', error);
      throw error;
    }
  }
};