// Sport → disciplines mapping. Athletes can multi-select disciplines for their sport.
// If a sport isn't mapped, the UI falls back to a free-text input.

export const SPORT_DISCIPLINES: Record<string, string[]> = {
  "Swimming": [
    "Freestyle", "Backstroke", "Breaststroke", "Butterfly",
    "Individual Medley", "Open Water Swimming", "Relay",
  ],
  "Athletics (Track & Field)": [
    "Sprints (100m / 200m / 400m)", "Middle Distance (800m / 1500m)",
    "Long Distance (5000m / 10000m)", "Hurdles", "Steeplechase",
    "Marathon", "Race Walking", "Long Jump", "Triple Jump",
    "High Jump", "Pole Vault", "Shot Put", "Discus", "Hammer Throw",
    "Javelin", "Heptathlon", "Decathlon", "Relays",
  ],
  "Cycling": [
    "Road Race", "Time Trial", "Track — Sprint", "Track — Endurance",
    "Mountain Bike (XC)", "Mountain Bike (Downhill)", "Gravel", "Cyclocross", "BMX Racing", "BMX Freestyle",
  ],
  "Triathlon": [
    "Sprint", "Olympic / Standard", "70.3 / Half Ironman", "Ironman", "Mixed Relay", "Duathlon", "Aquabike",
  ],
  "Football (Soccer)": [
    "Outfield — Forward", "Outfield — Midfielder", "Outfield — Defender", "Goalkeeper", "Futsal", "Beach Soccer",
  ],
  "Basketball": ["5x5", "3x3", "Wheelchair Basketball"],
  "Volleyball": ["Indoor", "Beach", "Sitting Volleyball"],
  "Tennis": ["Singles", "Doubles", "Mixed Doubles", "Wheelchair Tennis"],
  "Golf": ["Stroke Play", "Match Play", "Long Drive"],
  "Climbing": ["Sport / Lead", "Bouldering", "Speed", "Trad", "Big Wall"],
  "Skiing — Alpine": ["Downhill", "Super-G", "Giant Slalom", "Slalom", "Combined"],
  "Freestyle Skiing": ["Moguls", "Aerials", "Halfpipe", "Slopestyle", "Big Air", "Ski Cross"],
  "Snowboarding": ["Halfpipe", "Slopestyle", "Big Air", "Snowboard Cross", "Parallel Giant Slalom"],
  "Cross Country Skiing": ["Sprint", "Classic", "Skiathlon", "Relay", "Mass Start"],
  "Surfing": ["Shortboard", "Longboard", "Big Wave", "Adaptive"],
  "Rowing": ["Single Sculls", "Double Sculls", "Quadruple Sculls", "Coxless Pair", "Coxless Four", "Eight", "Lightweight"],
  "Sailing": ["Dinghy", "Skiff", "Windsurfer / iQFoil", "Kiteboarding", "Offshore Keelboat"],
  "Canoeing": ["Sprint", "Slalom", "Marathon", "Wildwater", "Stand-Up Paddle"],
  "Boxing": ["Amateur", "Professional"],
  "Mixed Martial Arts (MMA)": ["Strawweight", "Flyweight", "Bantamweight", "Featherweight", "Lightweight", "Welterweight"],
  "Wrestling": ["Freestyle", "Greco-Roman", "Beach Wrestling"],
  "Judo": ["-48kg", "-52kg", "-57kg", "-63kg", "-70kg", "-78kg", "+78kg", "Open weight"],
  "Taekwondo": ["Kyorugi (Sparring)", "Poomsae (Forms)"],
  "Karate": ["Kumite", "Kata"],
  "Fencing": ["Foil", "Épée", "Sabre"],
  "Artistic Gymnastics": ["All-Around", "Vault", "Uneven Bars", "Balance Beam", "Floor Exercise"],
  "Rhythmic Gymnastics": ["Hoop", "Ball", "Clubs", "Ribbon", "Group"],
  "Figure Skating": ["Singles", "Pairs", "Ice Dance", "Synchronized"],
  "Speed Skating": ["500m", "1000m", "1500m", "3000m", "5000m", "Mass Start", "Team Pursuit"],
  "Equestrian": ["Dressage", "Show Jumping", "Eventing", "Endurance", "Vaulting", "Para-Equestrian"],
  "Triathlon ": ["Sprint", "Olympic"], // tolerate trailing space typo
  "Weightlifting": ["Snatch", "Clean & Jerk", "Total"],
  "Powerlifting": ["Squat", "Bench Press", "Deadlift", "Equipped", "Raw"],
  "Trail Running": ["Short Trail (<42km)", "Long Trail (42-80km)", "Ultra (80km+)", "Skyrunning", "Vertical Kilometer"],
  "Marathon": ["Road Marathon", "Ultra Marathon", "Half Marathon"],
  "Rugby Union": ["15s", "Sevens"],
  "Rugby Sevens": ["Men's Sevens", "Women's Sevens"],
  "Ice Hockey": ["Forward", "Defense", "Goaltender"],
  "Field Hockey": ["Outdoor", "Indoor"],
  "Water Polo": ["Field Player", "Goalkeeper"],
  "Diving": ["3m Springboard", "10m Platform", "Synchronized", "High Diving"],
  "Skateboarding": ["Street", "Park", "Vert"],
  "BMX": ["Racing", "Freestyle Park", "Freestyle Flatland"],
  "Esports": ["FPS", "MOBA", "Fighting", "Racing Sim", "Sports Sim", "Battle Royale"],
};

export function getDisciplinesForSport(sport: string): string[] {
  if (!sport) return [];
  return SPORT_DISCIPLINES[sport] ?? [];
}
