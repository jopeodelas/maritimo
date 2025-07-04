import api from './api';

export interface Fixture {
  fixture_id: number;
  home_team: string;
  away_team: string;
  match_date: string;
  status: string;
  home_score?: number;
  away_score?: number;
}

export const getSeasonFixtures = async (season: number): Promise<Fixture[]> => {
  const response = await api.get(`/fixtures/season/${season}`);
  return response.data.matches || [];
}; 