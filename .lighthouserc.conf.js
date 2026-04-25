module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        staticDistDir: './dist',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};