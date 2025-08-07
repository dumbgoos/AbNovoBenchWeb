module.exports = {
  apps: [{
    name: 'abnovobench-api',
    script: 'src/server.js',
    cwd: '/root/abnovobench/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
} 