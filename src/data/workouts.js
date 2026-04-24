export const standardWorkouts = [
  {
    id: 'std-1',
    name: 'Endurance Fondamentale',
    description: '45 min à intensité modérée',
    intervals: [
      { duration: 600, cadence: 85, plateau: 1, pignon: 4, label: 'Échauffement' },
      { duration: 1800, cadence: 90, plateau: 2, pignon: 4, label: 'Endurance' },
      { duration: 300, cadence: 80, plateau: 1, pignon: 3, label: 'Retour au calme' }
    ]
  },
  {
    id: 'std-2',
    name: 'Intervalles PMA Courts',
    description: '30 min avec sprints répétés',
    intervals: [
      { duration: 300, cadence: 80, plateau: 1, pignon: 3, label: 'Échauffement' },
      
      { duration: 30, cadence: 105, plateau: 2, pignon: 6, label: 'Sprint PMA' },
      { duration: 30, cadence: 80, plateau: 1, pignon: 3, label: 'Récup' },
      { duration: 30, cadence: 105, plateau: 2, pignon: 6, label: 'Sprint PMA' },
      { duration: 30, cadence: 80, plateau: 1, pignon: 3, label: 'Récup' },
      { duration: 30, cadence: 105, plateau: 2, pignon: 6, label: 'Sprint PMA' },
      { duration: 30, cadence: 80, plateau: 1, pignon: 3, label: 'Récup' },
      { duration: 30, cadence: 105, plateau: 2, pignon: 6, label: 'Sprint PMA' },
      { duration: 30, cadence: 80, plateau: 1, pignon: 3, label: 'Récup' },
      { duration: 30, cadence: 105, plateau: 2, pignon: 6, label: 'Sprint PMA' },
      { duration: 30, cadence: 80, plateau: 1, pignon: 3, label: 'Récup' },
      
      { duration: 600, cadence: 85, plateau: 1, pignon: 4, label: 'Endurance' },
      { duration: 300, cadence: 75, plateau: 1, pignon: 2, label: 'Retour au calme' }
    ]
  }
];
