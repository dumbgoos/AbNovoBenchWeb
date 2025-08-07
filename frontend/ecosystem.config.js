module.exports = {
  apps: [{
    name: 'abnovobench-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/root/abnovobench/frontend',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
} 