import json

# Ask the user for the file path
file_path = input("Enter the path to the JSON file: ")

# Open the original file in read mode
with open(file_path, 'r') as file:
    # Open a new file in write mode
    with open('output_log_values.html', 'w') as output_file:
        # Read each line of the original file
        for line in file:
            # Parse the line as JSON
            data = json.loads(line)
            # Extract the "log" value
            log_value = data['log']
            # Write the "log" value to the new file
            output_file.write(log_value + '\n')

