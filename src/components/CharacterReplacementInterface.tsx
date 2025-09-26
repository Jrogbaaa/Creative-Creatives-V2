'use client';

import React, { useState, useCallback } from 'react';
import { HumanCharacterReference, CharacterReplacementRequest, ImageAsset } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Wand2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface CharacterReplacementInterfaceProps {
  sceneId: string;
  selectedImage: ImageAsset | null;
  characterReferences: HumanCharacterReference[];
  existingReplacements: CharacterReplacementRequest[];
  onRequestReplacement: (request: Omit<CharacterReplacementRequest, 'id' | 'createdAt'>) => void;
  onQuickApplyCharacter?: (characterId: string, sceneId: string) => void;
  isProcessing?: boolean;
  className?: string;
}

const CharacterReplacementInterface: React.FC<CharacterReplacementInterfaceProps> = ({
  sceneId,
  selectedImage,
  characterReferences,
  existingReplacements,
  onRequestReplacement,
  onQuickApplyCharacter,
  isProcessing = false,
  className = ''
}) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [replacementPrompt, setReplacementPrompt] = useState<string>('');
  const [targetDescription, setTargetDescription] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedCharacter = characterReferences.find(char => char.id === selectedCharacterId);

  const handleSubmitReplacement = useCallback(() => {
    if (!selectedCharacter || !replacementPrompt.trim() || !selectedImage) {
      return;
    }

    const request: Omit<CharacterReplacementRequest, 'id' | 'createdAt'> = {
      sceneId,
      characterReference: selectedCharacter,
      replacementPrompt: replacementPrompt.trim(),
      targetDescription: targetDescription.trim() || undefined
    };

    onRequestReplacement(request);

    // Reset form
    setReplacementPrompt('');
    setTargetDescription('');
    setSelectedCharacterId('');
    setShowAdvanced(false);
  }, [selectedCharacter, replacementPrompt, targetDescription, selectedImage, sceneId, onRequestReplacement]);

  const generateSuggestedPrompt = useCallback((character: HumanCharacterReference) => {
    const prompts = [
      `Replace the main person in this image with ${character.name}`,
      `Use ${character.name} as the primary character in this scene`,
      `Replace the person in the foreground with ${character.name}`,
      `Make ${character.name} the main subject of this advertisement`,
      `Substitute the current person with ${character.name} while maintaining the same pose and setting`
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }, []);

  const handleCharacterSelect = useCallback((characterId: string) => {
    setSelectedCharacterId(characterId);
    const character = characterReferences.find(char => char.id === characterId);
    if (character && !replacementPrompt) {
      setReplacementPrompt(generateSuggestedPrompt(character));
    }
  }, [characterReferences, replacementPrompt, generateSuggestedPrompt]);

  const handleQuickPrompt = useCallback((template: string) => {
    if (selectedCharacter) {
      setReplacementPrompt(template.replace('[CHARACTER]', selectedCharacter.name));
    }
  }, [selectedCharacter]);

  // Don't show if no character references are available
  if (characterReferences.length === 0) {
    return null;
  }

  // Don't show if no image is selected
  if (!selectedImage) {
    return (
      <Card className={`p-4 bg-yellow-50 border-yellow-200 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Select an image for this scene to use character replacement.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <UserCheck className="w-6 h-6 text-indigo-600" />
        <h4 className="text-lg font-semibold text-gray-900">
          Character Replacement
        </h4>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Replace characters in your selected image with your uploaded reference photos.
      </p>

      <div className="space-y-6">
        {/* Character Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Character Reference
          </label>
          <Select value={selectedCharacterId} onValueChange={handleCharacterSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a character to use..." />
            </SelectTrigger>
            <SelectContent>
              {characterReferences.map((character) => (
                <SelectItem key={character.id} value={character.id}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={`data:${character.mimeType};base64,${character.imageData}`}
                        alt={character.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <span className="font-medium">{character.name}</span>
                      {character.description && (
                        <span className="text-gray-500 text-xs ml-2">
                          • {character.description}
                        </span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Apply Section */}
        {onQuickApplyCharacter && characterReferences.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-green-600" />
              Quick Apply Characters
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {characterReferences.map((character) => {
                const alreadyApplied = existingReplacements.some(req => req.characterReference.id === character.id);
                
                return (
                  <Button
                    key={character.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onQuickApplyCharacter(character.id, sceneId)}
                    disabled={isProcessing || alreadyApplied}
                    className={`flex items-center gap-2 p-3 h-auto justify-start ${
                      alreadyApplied ? 'bg-gray-100 text-gray-500' : 'bg-white hover:bg-green-50 hover:border-green-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={`data:${character.mimeType};base64,${character.imageData}`}
                        alt={character.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-xs">{character.name}</div>
                      {alreadyApplied && (
                        <div className="text-xs text-gray-500">Already applied</div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              One-click application with default replacement prompt
            </p>
          </div>
        )}

        {/* Selected Character Preview */}
        {selectedCharacter && (
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-indigo-200">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={`data:${selectedCharacter.mimeType};base64,${selectedCharacter.imageData}`}
                alt={selectedCharacter.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h5 className="font-medium text-gray-900">{selectedCharacter.name}</h5>
              {selectedCharacter.description && (
                <p className="text-sm text-gray-600">{selectedCharacter.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Replacement Prompt */}
        {selectedCharacter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Replacement Instructions
            </label>
            <Input
              type="text"
              placeholder="Describe how you want to replace the character..."
              value={replacementPrompt}
              onChange={(e) => setReplacementPrompt(e.target.value)}
              className="w-full mb-3"
            />
            
            {/* Quick Prompt Templates */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt('Replace the main person in this image with [CHARACTER]')}
                className="text-xs"
              >
                Replace Main Person
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt('Use [CHARACTER] as the primary character in this scene')}
                className="text-xs"
              >
                Primary Character
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt('Replace the person in the foreground with [CHARACTER]')}
                className="text-xs"
              >
                Foreground Person
              </Button>
            </div>

            {/* Advanced Options */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-indigo-600 hover:text-indigo-700 p-0 h-auto"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>

            {showAdvanced && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Description (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., the person in the blue shirt, the woman on the left"
                  value={targetDescription}
                  onChange={(e) => setTargetDescription(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Specify which person or character to replace if there are multiple people in the image.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {selectedCharacter && replacementPrompt.trim() && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Ready to replace character in scene {sceneId.split('_')[1] || 'N/A'}
            </div>
            <Button
              onClick={handleSubmitReplacement}
              disabled={isProcessing || !selectedCharacter || !replacementPrompt.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Replace Character
                </>
              )}
            </Button>
          </div>
        )}

        {/* Existing Replacements */}
        {existingReplacements.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h5 className="font-medium text-gray-900 mb-3">Previous Replacements</h5>
            <div className="space-y-2">
              {existingReplacements.map((replacement) => (
                <div
                  key={replacement.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                      <Image
                        src={`data:${replacement.characterReference.mimeType};base64,${replacement.characterReference.imageData}`}
                        alt={replacement.characterReference.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {replacement.characterReference.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {replacement.replacementPrompt}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CharacterReplacementInterface;
