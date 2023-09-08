#!/bin/bash
# Not required one day if this is resolved: https://github.com/microsoft/TypeScript/issues/49462

# Specify the directory where you want to change file extensions recursively
directory="./dist"

# Use the find command to locate all ".js" files in the directory and its subdirectories
find "$directory" -type f -name "*.js" -print0 | while read -d $'\0' file
do
    # Use parameter expansion to change the extension from ".js" to ".cjs"
    new_file="${file%.js}.cjs"

    # Rename the file
    mv "$file" "$new_file"

    echo "Renamed: $file -> $new_file"
done