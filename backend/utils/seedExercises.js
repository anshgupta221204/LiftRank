const Exercise = require('../models/Exercise');

const defaultExercises = [
  // Chest
  {
    name: 'Bench Press',
    muscleGroup: 'Chest',
    description: 'Flat barbell bench press targeting the pectoral muscles, anterior deltoids, and triceps.',
  },
  {
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    description: 'Incline dumbbell press targeting the upper clavicular head of the chest.',
  },
  
  // Back
  {
    name: 'Deadlift',
    muscleGroup: 'Back',
    description: 'Barbell deadlift targeting the posterior chain including the back, glutes, and hamstrings.',
  },
  {
    name: 'Pull-up',
    muscleGroup: 'Back',
    description: 'Bodyweight or weighted vertical pull-up targeting the latissimus dorsi and back thickness.',
  },
  {
    name: 'Barbell Row',
    muscleGroup: 'Back',
    description: 'Bent-over barbell row targeting the latissimus dorsi, rhomboids, and middle back.',
  },
  
  // Shoulders
  {
    name: 'Overhead Press',
    muscleGroup: 'Shoulders',
    description: 'Standing barbell overhead press targeting the anterior deltoids and shoulder stability.',
  },
  {
    name: 'Lateral Raise',
    muscleGroup: 'Shoulders',
    description: 'Dumbbell lateral raise targeting the lateral head of the deltoids for shoulder width.',
  },
  
  // Arms
  {
    name: 'Bicep Curl',
    muscleGroup: 'Arms',
    description: 'Barbell or dumbbell curl targeting the biceps brachii.',
  },
  {
    name: 'Tricep Pushdown',
    muscleGroup: 'Arms',
    description: 'Cable pushdown targeting the lateral and medial heads of the triceps.',
  },
  
  // Legs
  {
    name: 'Squat',
    muscleGroup: 'Legs',
    description: 'Barbell back squat targeting the quadriceps, gluteus maximus, and hamstrings.',
  },
  {
    name: 'Leg Press',
    muscleGroup: 'Legs',
    description: 'Incline machine leg press targeting the quadriceps and glutes.',
  },
  {
    name: 'Lying Leg Curl',
    muscleGroup: 'Legs',
    description: 'Lying leg curl machine targeting the hamstring muscle group.',
  },
  
  // Abs
  {
    name: 'Plank',
    muscleGroup: 'Abs',
    description: 'Static core holds targeting the rectus abdominis and transverse abdominis.',
  },
  {
    name: 'Hanging Leg Raise',
    muscleGroup: 'Abs',
    description: 'Hanging abdominal exercise targeting the lower abs and hip flexors.',
  },
  {
    name: 'Crunches',
    muscleGroup: 'Abs',
    description: 'Basic crunch targeting the upper abdominal muscles.',
  },
];

const seedExercises = async () => {
  try {
    const count = await Exercise.countDocuments();
    if (count === 0) {
      await Exercise.insertMany(defaultExercises);
      console.log('Database seeded with 15 default exercises.');
    }
  } catch (err) {
    console.error('Error seeding exercises:', err.message);
  }
};

module.exports = seedExercises;
