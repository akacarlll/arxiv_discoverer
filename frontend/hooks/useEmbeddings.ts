import { useState, useEffect } from 'react';
import { EmbeddingsData } from '../types';

interface UseEmbeddingsReturn {
  data: EmbeddingsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useEmbeddings = (dataPath: string = '/data/embeddings.json'): UseEmbeddingsReturn => {
  const [data, setData] = useState<EmbeddingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(dataPath);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const jsonData: EmbeddingsData = await response.json();

      // Validate data structure
      if (!jsonData.coordinates || !Array.isArray(jsonData.coordinates)) {
        throw new Error('Invalid data format: missing or invalid coordinates array');
      }

      if (!jsonData.details || typeof jsonData.details !== 'object') {
        throw new Error('Invalid data format: missing or invalid details object');
      }

      // Validate that all coordinates have matching details
      const missingDetails = jsonData.coordinates.filter(
        coord => !jsonData.details[coord.id]
      );

      if (missingDetails.length > 0) {
        console.warn(
          `Warning: ${missingDetails.length} coordinates missing details:`,
          missingDetails.slice(0, 5).map(c => c.id)
        );
      }

      setData(jsonData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error loading embeddings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataPath]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Helper hook for generating sample data (for testing)
export const useSampleEmbeddings = (count: number = 200): UseEmbeddingsReturn => {
  const [data, setData] = useState<EmbeddingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate network delay
    const timer = setTimeout(() => {
      const sampleData: EmbeddingsData = {
        coordinates: Array.from({ length: count }, (_, i) => ({
          id: `paper_${i}`,
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2,
        })),
        details: Object.fromEntries(
          Array.from({ length: count }, (_, i) => [
            `paper_${i}`,
            {
              title: `Research Paper ${i + 1}: ${
                ['Deep Learning Applications', 'Neural Network Architectures', 'Computer Vision Methods', 'Natural Language Processing', 'Reinforcement Learning Techniques'][i % 5]
              }`,
              authors: `Author ${String.fromCharCode(65 + (i % 26))} et al.`,
              year: 2020 + (i % 5),
              category: ['cs.AI', 'cs.LG', 'cs.CV', 'cs.CL', 'cs.NE'][i % 5],
              abstract: `This paper explores various aspects of ${
                ['artificial intelligence', 'machine learning', 'computer vision', 'natural language understanding', 'reinforcement learning'][i % 5]
              }. We propose a novel approach that demonstrates significant improvements over existing methods. Our experiments show promising results across multiple benchmarks and real-world applications.`,
              citations: Math.floor(Math.random() * 1000),
              url: `https://arxiv.org/abs/21${String(i).padStart(2, '0')}.00001`,
            },
          ])
        ),
        metadata: {
          totalPapers: count,
          categories: ['cs.AI', 'cs.LG', 'cs.CV', 'cs.CL', 'cs.NE'],
          dateGenerated: new Date().toISOString(),
        },
      };

      setData(sampleData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count]);

  return {
    data,
    loading,
    error: null,
    refetch: () => {},
  };
};