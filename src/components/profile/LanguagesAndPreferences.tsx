
import React from "react";
import { LanguageSelector, type LanguageWithLevel } from "@/components/LanguageSelector";
import { Checkbox } from "@/components/ui/checkbox";

interface LanguagesAndPreferencesProps {
  nativeLanguages: LanguageWithLevel[];
  learningLanguages: LanguageWithLevel[];
  lookingFor: string[];
  onNativeLanguagesChange: (languages: LanguageWithLevel[]) => void;
  onLearningLanguagesChange: (languages: LanguageWithLevel[]) => void;
  onLookingForChange: (lookingFor: string[]) => void;
}

export const LanguagesAndPreferences = ({
  nativeLanguages,
  learningLanguages,
  lookingFor,
  onNativeLanguagesChange,
  onLearningLanguagesChange,
  onLookingForChange,
}: LanguagesAndPreferencesProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-[#6153BD] mb-2">
          Native Languages
        </label>
        <LanguageSelector
          languages={nativeLanguages}
          onChange={onNativeLanguagesChange}
          showLevel={false}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#6153BD] mb-2">
          Learning Languages
        </label>
        <LanguageSelector
          languages={learningLanguages}
          onChange={onLearningLanguagesChange}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#6153BD] mb-2">
          I'm Looking For
        </label>
        <div className="space-y-2">
          {['friends', 'postal_exchange', 'in_person_meetings', 'flirting'].map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={lookingFor.includes(option)}
                onCheckedChange={(checked) => {
                  onLookingForChange(
                    checked
                      ? [...lookingFor, option]
                      : lookingFor.filter(item => item !== option)
                  );
                }}
              />
              <label
                htmlFor={option}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
