#!/usr/bin/env python3
"""
Clean up old virtual try-on images to save disk space.
Removes files older than specified days.
"""

import os
import time
from pathlib import Path
from datetime import datetime, timedelta

def cleanup_old_uploads(base_path: str, days_to_keep: int = 7):
    """Remove virtual try-on images older than specified days."""
    
    upload_dir = Path(base_path)
    if not upload_dir.exists():
        print(f"Upload directory not found: {upload_dir}")
        return
    
    cutoff_time = time.time() - (days_to_keep * 24 * 60 * 60)
    removed_count = 0
    removed_size = 0
    
    # Find all virtual try-on directories
    for user_dir in upload_dir.iterdir():
        if not user_dir.is_dir():
            continue
            
        vton_dir = user_dir / "virtual_tryon"
        if not vton_dir.exists():
            continue
            
        # Check each file in virtual_tryon directory
        for file_path in vton_dir.iterdir():
            if file_path.is_file():
                file_stat = file_path.stat()
                if file_stat.st_mtime < cutoff_time:
                    removed_size += file_stat.st_size
                    file_path.unlink()
                    removed_count += 1
                    print(f"Removed: {file_path.name}")
    
    # Convert size to MB
    removed_size_mb = removed_size / (1024 * 1024)
    
    print(f"\nCleanup complete!")
    print(f"Removed {removed_count} files")
    print(f"Freed up {removed_size_mb:.2f} MB")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Clean up old virtual try-on images")
    parser.add_argument(
        "--days", 
        type=int, 
        default=7,
        help="Number of days to keep files (default: 7)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be deleted without actually deleting"
    )
    
    args = parser.parse_args()
    
    base_path = "app/data/uploads"
    print(f"Cleaning up files older than {args.days} days from {base_path}")
    
    if args.dry_run:
        print("DRY RUN - No files will be deleted")
    
    cleanup_old_uploads(base_path, args.days)