import api from './api';

export interface Fixture {
  fixture_id: number;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  match_date: string;
  status: string;
  home_score?: number;
  away_score?: number;
  venue?: string;
  competition?: string;
  round?: string;
}

export const getSeasonFixtures = async (season: number): Promise<Fixture[]> => {
  const response = await api.get(`/fixtures/season/${season}`);
  return response.data.matches || [];
}; 