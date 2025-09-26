'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { HumanCharacterReference, StoryboardScene, CharacterReplacementRequest } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Zap, CheckCircle, Clock, AlertCircle, Wand2, Eye, Copy } from 'lucide-react';
import Image from 'next/image';

interface CharacterUsageData {
  character: HumanCharacterReference;
  usedInScenes: string[];
  availableScenes: string[];
  isProcessing: boolean;
}

interface CharacterConsistencyManagerProps {
  characterReferences: HumanCharacterReference[];
  scenes: StoryboardScene[];
  onBatchCharacterApplication: (characterId: string, sceneIds: string[], prompt?: string) => void;
  onQuickApplyCharacter: (characterId: string, sceneId: string) => void;
  isProcessingBatch: boolean;
  currentProcessingScenes: string[];
  className?: string;
}

const CharacterConsistencyManager: React.FC<CharacterConsistencyManagerProps> = ({
  characterReferences,
  scenes,
  onBatchCharacterApplication,
  onQuickApplyCharacter,
  isProcessingBatch,
  currentProcessingScenes,
  className = ''
}) => {
  const [selectedCharacterForBatch, setSelectedCharacterForBatch] = useState<string>('');
  const [selectedScenes, setSelectedScenes] = useState<Set<string>>(new Set());
  const [batchPrompt, setBatchPrompt] = useState<string>('');
  const [showBatchOptions, setShowBatchOptions] = useState<boolean>(false);

  // Calculate character usage data
  const characterUsageData: CharacterUsageData[] = useMemo(() => {
    return characterReferences.map(character => {
      const usedInScenes = scenes
        .filter(scene => 
          scene.characterReplacements?.some(req => req.characterReference.id === character.id) ||
          scene.replacedImages?.some(result => result.characterReference.id === character.id)
        )
        .map(scene => scene.id);

      const availableScenes = scenes
        .filter(scene => 
          scene.selectedImageId && // Only scenes with selected images
          !usedInScenes.includes(scene.id) // Not already using this character
        )
        .map(scene => scene.id);

      return {
        character,
        usedInScenes,
        availableScenes,
        isProcessing: currentProcessingScenes.some(sceneId => usedInScenes.includes(sceneId))
      };
    });
  }, [characterReferences, scenes, currentProcessingScenes]);

  const handleSceneToggle = useCallback((sceneId: string) => {
    setSelectedScenes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sceneId)) {
        newSet.delete(sceneId);
      } else {
        newSet.add(sceneId);
      }
      return newSet;
    });
  }, []);

  const handleBatchApply = useCallback(() => {
    if (selectedCharacterForBatch && selectedScenes.size > 0) {
      const character = characterReferences.find(char => char.id === selectedCharacterForBatch);
      const promptToUse = batchPrompt.trim() || `Replace the main character in these scenes with ${character?.name}`;
      
      onBatchCharacterApplication(selectedCharacterForBatch, Array.from(selectedScenes), promptToUse);
      
      // Reset state
      setSelectedScenes(new Set());
      setBatchPrompt('');
      setShowBatchOptions(false);
    }
  }, [selectedCharacterForBatch, selectedScenes, batchPrompt, characterReferences, onBatchCharacterApplication]);

  const handleSelectAllAvailable = useCallback((characterId: string) => {
    const characterData = characterUsageData.find(data => data.character.id === characterId);
    if (characterData) {
      setSelectedScenes(new Set(characterData.availableScenes));
      setSelectedCharacterForBatch(characterId);
      setShowBatchOptions(true);
    }
  }, [characterUsageData]);

  const getSceneName = useCallback((sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    return scene ? `Scene ${scene.sceneNumber}: ${scene.title}` : 'Unknown Scene';
  }, [scenes]);

  if (characterReferences.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Character Consistency Manager</h3>
            <p className="text-sm text-gray-600">Apply the same character across multiple scenes for consistency</p>
          </div>
        </div>

        {/* Character Usage Overview */}
        <div className="space-y-4 mb-6">
          {characterUsageData.map((data) => (
            <div key={data.character.id} className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-4">
                {/* Character Avatar */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={`data:${data.character.mimeType};base64,${data.character.imageData}`}
                    alt={data.character.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Character Info & Controls */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{data.character.name}</h4>
                      {data.character.description && (
                        <p className="text-sm text-gray-600 mt-1">{data.character.description}</p>
                      )}
                    </div>
                    
                    {/* Processing Status */}
                    {data.isProcessing && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        <Clock className="w-3 h-3 mr-1" />
                        Processing
                      </Badge>
                    )}
                  </div>

                  {/* Usage Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">
                        Used in {data.usedInScenes.length} scene{data.usedInScenes.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-gray-600">
                        Available for {data.availableScenes.length} scene{data.availableScenes.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Scene Lists */}
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    {data.usedInScenes.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Used In:</p>
                        <div className="flex flex-wrap gap-1">
                          {data.usedInScenes.map(sceneId => (
                            <Badge key={sceneId} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                              {getSceneName(sceneId)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.availableScenes.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Available For:</p>
                        <div className="flex flex-wrap gap-1">
                          {data.availableScenes.slice(0, 3).map(sceneId => (
                            <Badge key={sceneId} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                              {getSceneName(sceneId)}
                            </Badge>
                          ))}
                          {data.availableScenes.length > 3 && (
                            <Badge variant="outline" className="text-xs text-gray-600">
                              +{data.availableScenes.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {data.availableScenes.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSelectAllAvailable(data.character.id)}
                        disabled={isProcessingBatch || data.isProcessing}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Apply to All Available
                      </Button>
                    )}
                    
                    {data.availableScenes.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCharacterForBatch(data.character.id);
                          setShowBatchOptions(true);
                        }}
                        disabled={isProcessingBatch || data.isProcessing}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Custom Selection
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Batch Application Interface */}
        {showBatchOptions && (
          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-600" />
              Batch Character Application
            </h4>

            {/* Character Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Character
              </label>
              <Select value={selectedCharacterForBatch} onValueChange={setSelectedCharacterForBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a character..." />
                </SelectTrigger>
                <SelectContent>
                  {characterReferences.map((character) => (
                    <SelectItem key={character.id} value={character.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded overflow-hidden bg-gray-100">
                          <Image
                            src={`data:${character.mimeType};base64,${character.imageData}`}
                            alt={character.name}
                            width={24}
                            height={24}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        {character.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scene Selection */}
            {selectedCharacterForBatch && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Scenes ({selectedScenes.size} selected)
                </label>
                <div className="grid md:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-white rounded border">
                  {scenes
                    .filter(scene => scene.selectedImageId)
                    .map((scene) => {
                      const isSelected = selectedScenes.has(scene.id);
                      const isUsed = scene.characterReplacements?.some(req => req.characterReference.id === selectedCharacterForBatch);
                      
                      return (
                        <label
                          key={scene.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-gray-50'
                          } ${isUsed ? 'opacity-50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSceneToggle(scene.id)}
                            disabled={isUsed}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm">
                            Scene {scene.sceneNumber}: {scene.title}
                            {isUsed && <span className="text-gray-500 ml-1">(already applied)</span>}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Batch Prompt */}
            {selectedScenes.size > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Prompt (optional)
                </label>
                <input
                  type="text"
                  value={batchPrompt}
                  onChange={(e) => setBatchPrompt(e.target.value)}
                  placeholder="e.g., Replace the main character with [character name] while keeping the same pose"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowBatchOptions(false);
                  setSelectedScenes(new Set());
                  setBatchPrompt('');
                  setSelectedCharacterForBatch('');
                }}
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                onClick={handleBatchApply}
                disabled={!selectedCharacterForBatch || selectedScenes.size === 0 || isProcessingBatch}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isProcessingBatch ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processing {selectedScenes.size} scenes...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Apply to {selectedScenes.size} Scene{selectedScenes.size !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default CharacterConsistencyManager;
