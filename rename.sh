#!/bin/bash

# Loop through all files matching the pattern
for file in EP.*.v*.1080p.mp4; do
  # Extract the episode number using regex
  if [[ $file =~ EP\.([0-9]+)\.v[0-9]+\..* ]]; then
    episode_number=${BASH_REMATCH[1]}
    # Construct the new file name
    new_file_name="one_piece_E${episode_number}.mp4"
    # Rename the file
    mv "$file" "$new_file_name"
    echo "Renamed '$file' to '$new_file_name'"
  else
    echo "Skipping '$file': No match found"
  fi
done

echo "All files processed!"
