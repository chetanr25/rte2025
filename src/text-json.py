import json
import requests

class textToJSON():
    def __init__(self, transcript_text, target_fields, json="{"):
        self.__transcript_text = transcript_text # str
        self.__target_fields = target_fields # List, contains the template field.
        self.type_check_all()
        self.main_loop()
        self.__json = json

    
    def type_check_all(self):
        if type(self.__transcript_text) != str:
            raise TypeError(f"ERROR in textToJSON() ->\
                Transcript must be text. Input:\n\ttranscript_text: {self.__transcript_text}")
        elif type(self.__target_fields) != list:  
            raise TypeError(f"ERROR in textToJSON() ->\
                Target fields must be a list. Input:\n\ttarget_fields: {self.__target_fields}")

   
    def build_prompt(self, current_field):
        """ 
            This method is in charge of the prompt engineering. It creates a specific prompt for each target field. 
            @params: current_field -> represents the current element of the json that is being prompted.
        """
        prompt = f""" 
            SYSTEM PROMPT:
            You are an AI assistant designed to help fillout json files with information extracted from transcribed voice recordings. 
            You will receive the transcription, and the name of the JSON field whose value you have to identify in the context. Return 
            only a single string containing the identified value for the JSON field. 
            If the field name is plural, and you identify more than one possible value in the text, return both separated by a ";".
            If you don't identify the value in the provided text, return "-1".
            ---
            DATA:
            Target JSON field to find in text: {current_field}
            
            TEXT: {self.__transcript_text}
            """

        return prompt

    def main_loop(self): #FUTURE -> Refactor this to its own class
        for field in self.__target_fields:
            prompt = self.build_prompt(field)
            # print(prompt)
            ollama_url = "http://localhost:11434/api/generate"

            payload = {
                "model": "mistral",
                "prompt": prompt,
                "stream": False # don't really know why --> look into this later.
            }

            response = requests.post(ollama_url, json=payload)

            # parse response
            json_data = response.json()
            parsed_response = json_data['response']
            print(parsed_response)
            self.__json += f'\n\t"{field}": "{parsed_response}",'
        self.__json += '\n}'
        print(self.__json)
        return None

if __name__ == "__main__":
    text = "Officer Voldemort here, at an incident reported at 456 Oak Street. Two victims, Mark Smith and Jane Doe. Medical aid rendered for minor lacerations. Handed off to Sheriff's Deputy Alvarez. End of transmission."
    fields = ["reporting_officer", "incident_location", "amount_of_victims", "victim_name_s", "assisting_officer"]
    t2j = textToJSON(text, fields)

