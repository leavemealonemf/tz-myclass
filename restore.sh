#!/bin/bash
psql -U postgres -d test -f /backup/backup.sql
