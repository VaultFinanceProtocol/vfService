# Docker Data Directories

This directory contains Docker volume mounts for local development.

## Directory Structure

```
docker/
├── .gitignore          # Ignore all data files
├── README.md           # This file
├── redis/
│   └── data/          # Redis AOF persistence files
└── postgres/
    └── data/          # PostgreSQL database files
```

## Redis Configuration

Redis is configured with the following settings:

- **AOF Persistence**: Enabled (`appendonly yes`)
- **Sync Policy**: Every second (`appendfsync everysec`)
- **Memory Limit**: 512mb (dev) / 2gb (production)
- **Eviction Policy**: `noeviction` (reject new writes when full)
- **RDB Snapshots**: Disabled (using AOF only)

### Why AOF only?

- Better durability guarantees
- Easier to recover from crashes
- Suitable for queue workloads (BullMQ)

## PostgreSQL Configuration

Standard PostgreSQL 16 with:
- Persistent data storage
- Health checks enabled
- Automatic restarts

## Important Notes

1. **Do not commit data files**: All data directories are gitignored
2. **Backup important data**: These volumes are for local development only
3. **Clean up**: Run `docker-compose down -v` to remove volumes
