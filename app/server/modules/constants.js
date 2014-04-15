exports.KEYS = {
  PROCESSES: 'overcast.health.processes',
  SNAPSHOT: 'overcast.health.snapshot',
  MONTHLY: 'overcast.health.monthly',
  WEEKLY: 'overcast.health.weekly',
  DAILY: 'overcast.health.daily'
};

exports.LIMITS = {
  MONTHLY: 180, // assuming 4 hour interval
  WEEKLY: 168, // assuming 1 hour interval
  DAILY: 144 // assuming 5 min interval
};
