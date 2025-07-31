import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useState } from 'react';

const HEALTH_QUERY = gql`
  query GetHealth {
    health
  }
`;

const GET_CALENDARS = gql`
  query GetCalendars {
    calendars {
      id
      name
      description
      owner {
        id
        email
        name
      }
      createdAt
    }
  }
`;

const CREATE_CALENDAR = gql`
  mutation CreateCalendar($input: CreateCalendarInput!) {
    createCalendar(input: $input) {
      id
      name
      description
      owner {
        id
        email
        name
      }
      createdAt
    }
  }
`;

export default function TestGraphQL() {
  const [calendarName, setCalendarName] = useState('');
  const [calendarDesc, setCalendarDesc] = useState('');
  
  const { data: healthData, loading: healthLoading, error: healthError } = useQuery(HEALTH_QUERY);
  const { data: calendarsData, loading: calendarsLoading, error: calendarsError, refetch } = useQuery(GET_CALENDARS);
  const [createCalendar, { loading: createLoading }] = useMutation(CREATE_CALENDAR, {
    onCompleted: () => {
      refetch();
      setCalendarName('');
      setCalendarDesc('');
    }
  });

  const handleCreateCalendar = () => {
    if (calendarName) {
      createCalendar({
        variables: {
          input: {
            name: calendarName,
            description: calendarDesc
          }
        }
      });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>GraphQL Test Page</h1>
      
      <section style={{ marginBottom: '30px' }}>
        <h2>Health Check</h2>
        {healthLoading && <p>Loading...</p>}
        {healthError && <p style={{ color: 'red' }}>Error: {healthError.message}</p>}
        {healthData && <p>Status: {healthData.health}</p>}
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>Create Calendar</h2>
        <div>
          <input
            type="text"
            placeholder="Calendar name"
            value={calendarName}
            onChange={(e) => setCalendarName(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={calendarDesc}
            onChange={(e) => setCalendarDesc(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <button 
            onClick={handleCreateCalendar} 
            disabled={createLoading || !calendarName}
            style={{ padding: '5px 10px' }}
          >
            {createLoading ? 'Creating...' : 'Create Calendar'}
          </button>
        </div>
      </section>

      <section>
        <h2>Calendars</h2>
        {calendarsLoading && <p>Loading...</p>}
        {calendarsError && <p style={{ color: 'red' }}>Error: {calendarsError.message}</p>}
        {calendarsData && (
          <div>
            {calendarsData.calendars.length === 0 ? (
              <p>No calendars yet</p>
            ) : (
              <ul>
                {calendarsData.calendars.map((calendar: any) => (
                  <li key={calendar.id}>
                    <strong>{calendar.name}</strong>
                    {calendar.description && <span> - {calendar.description}</span>}
                    <br />
                    <small>Created: {new Date(calendar.createdAt).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
}