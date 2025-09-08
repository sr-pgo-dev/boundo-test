// Location service for handling country/state/city data
export interface LocationData {
  countries: string[];
  states: Record<string, string[]>;
  cities: Record<string, Record<string, string[]>>;
}

// Mock location data - in production, this would come from APIs
export const locationData: LocationData = {
  countries: [
    'United States',
    'Canada', 
    'United Kingdom',
    'Australia',
    'Germany',
    'France'
  ],
  states: {
    'United States': [
      'California',
      'New York', 
      'Texas',
      'Florida',
      'Illinois',
      'Pennsylvania'
    ],
    'Canada': [
      'Ontario',
      'Quebec',
      'British Columbia',
      'Alberta',
      'Manitoba',
      'Saskatchewan'
    ],
    'United Kingdom': [
      'England',
      'Scotland',
      'Wales',
      'Northern Ireland'
    ],
    'Australia': [
      'New South Wales',
      'Victoria',
      'Queensland',
      'Western Australia',
      'South Australia',
      'Tasmania'
    ]
  },
  cities: {
    'United States': {
      'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'Oakland'],
      'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse'],
      'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
      'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee']
    },
    'Canada': {
      'Ontario': ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Windsor'],
      'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'],
      'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond']
    }
  }
};

export const getCountries = () => locationData.countries;
export const getStates = (country: string) => locationData.states[country] || [];
export const getCities = (country: string, state: string) => locationData.cities[country]?.[state] || [];
