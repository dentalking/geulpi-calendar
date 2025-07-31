import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const PARSE_NL_EVENT = gql`
  mutation ParseNaturalLanguageEvent($text: String!) {
    parseNaturalLanguageEvent(text: $text) {
      title
      description
      startTime
      endTime
      location
    }
  }
`;

const OPTIMIZE_SCHEDULE = gql`
  mutation OptimizeSchedule($events: [EventInput!]!, $preferences: PreferencesInput) {
    optimizeSchedule(events: $events, preferences: $preferences) {
      success
      message
      optimizedEvents {
        originalId
        title
        startTime
        endTime
        suggestion
      }
    }
  }
`;

export default function AITest() {
  const [nlText, setNlText] = useState('');
  const [parsedEvent, setParsedEvent] = useState<any>(null);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  
  const [parseNLEvent, { loading: parseLoading }] = useMutation(PARSE_NL_EVENT, {
    onCompleted: (data) => {
      setParsedEvent(data.parseNaturalLanguageEvent);
    },
    onError: (error) => {
      console.error('Parse error:', error);
      alert(`Error: ${error.message}`);
    }
  });
  
  const [optimizeSchedule, { loading: optimizeLoading }] = useMutation(OPTIMIZE_SCHEDULE, {
    onCompleted: (data) => {
      setOptimizationResult(data.optimizeSchedule);
    },
    onError: (error) => {
      console.error('Optimization error:', error);
      alert(`Error: ${error.message}`);
    }
  });

  const handleParse = () => {
    if (nlText.trim()) {
      parseNLEvent({ variables: { text: nlText } });
    }
  };

  const handleOptimize = () => {
    const sampleEvents = [
      {
        id: '1',
        title: 'Morning Standup',
        startTime: '2025-08-01T09:00:00Z',
        endTime: '2025-08-01T09:30:00Z',
        location: 'Conference Room A'
      },
      {
        id: '2',
        title: 'Client Meeting',
        startTime: '2025-08-01T10:00:00Z',
        endTime: '2025-08-01T11:00:00Z',
        location: 'Zoom'
      },
      {
        id: '3',
        title: 'Lunch Break',
        startTime: '2025-08-01T12:00:00Z',
        endTime: '2025-08-01T13:00:00Z',
        location: 'Cafeteria'
      }
    ];
    
    const preferences = {
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      preferredMeetingDuration: 30
    };
    
    optimizeSchedule({ variables: { events: sampleEvents, preferences } });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>AI Features Test</h1>
      
      <section style={{ marginBottom: '30px' }}>
        <h2>Natural Language Event Parser</h2>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            value={nlText}
            onChange={(e) => setNlText(e.target.value)}
            placeholder="Enter event in natural language, e.g., 'Meeting with John tomorrow at 2pm for 1 hour'"
            style={{ width: '100%', height: '80px', padding: '5px' }}
          />
        </div>
        <button 
          onClick={handleParse} 
          disabled={parseLoading || !nlText.trim()}
          style={{ padding: '5px 10px' }}
        >
          {parseLoading ? 'Parsing...' : 'Parse Event'}
        </button>
        
        {parsedEvent && (
          <div style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px' }}>
            <h3>Parsed Event:</h3>
            <pre>{JSON.stringify(parsedEvent, null, 2)}</pre>
          </div>
        )}
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>Schedule Optimization</h2>
        <p>Click the button below to optimize a sample schedule</p>
        <button 
          onClick={handleOptimize} 
          disabled={optimizeLoading}
          style={{ padding: '5px 10px' }}
        >
          {optimizeLoading ? 'Optimizing...' : 'Optimize Sample Schedule'}
        </button>
        
        {optimizationResult && (
          <div style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px' }}>
            <h3>Optimization Result:</h3>
            <p>Success: {optimizationResult.success ? 'Yes' : 'No'}</p>
            <p>Message: {optimizationResult.message}</p>
            <h4>Optimized Events:</h4>
            <pre>{JSON.stringify(optimizationResult.optimizedEvents, null, 2)}</pre>
          </div>
        )}
      </section>
    </div>
  );
}