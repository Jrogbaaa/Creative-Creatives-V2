'use client';

import React, { useState, useRef, useCallback } from 'react';
import { HumanCharacterReference } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, User, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface CharacterReferenceUploadProps {
  characterReferences: HumanCharacterReference[];
  onAddCharacter: (character: HumanCharacterReference) => void;
  onRemoveCharacter: (characterId: string) => void;
  maxCharacters?: number;
  className?: string;
}

const CharacterReferenceUpload: React.FC<CharacterReferenceUploadProps> = ({
  characterReferences,
  onAddCharacter,
  onRemoveCharacter,
  maxCharacters = 5,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterDescription, setNewCharacterDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertImageToBase64 = useCallback((file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1]; // Remove data:image/...;base64, prefix
        resolve({
          data: base64Data,
          mimeType: file.type
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size must be less than 10MB');
      return;
    }

    // Check if we've reached the maximum number of characters
    if (characterReferences.length >= maxCharacters) {
      alert(`Maximum ${maxCharacters} character references allowed`);
      return;
    }

    setIsUploading(true);
    
    try {
      const { data, mimeType } = await convertImageToBase64(file);
      
      const newCharacter: HumanCharacterReference = {
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newCharacterName.trim() || `Character ${characterReferences.length + 1}`,
        imageData: data,
        mimeType,
        uploadedAt: new Date(),
        description: newCharacterDescription.trim() || undefined
      };
      
      onAddCharacter(newCharacter);
      
      // Clear form
      setNewCharacterName('');
      setNewCharacterDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [characterReferences.length, maxCharacters, newCharacterName, newCharacterDescription, onAddCharacter, convertImageToBase64]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleRemoveCharacter = useCallback((characterId: string) => {
    onRemoveCharacter(characterId);
  }, [onRemoveCharacter]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          Character References
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          Upload photos of people you'd like to replace characters with in your storyboard scenes. 
          You can add up to {maxCharacters} character references.
        </p>

        {/* Character Name and Description Input */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Character Name
            </label>
            <Input
              type="text"
              placeholder="e.g., CEO John, Model Sarah"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <Input
              type="text"
              placeholder="e.g., Company CEO in formal wear"
              value={newCharacterDescription}
              onChange={(e) => setNewCharacterDescription(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
              ) : (
                <Upload className="w-8 h-8 text-purple-600" />
              )}
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {isUploading ? 'Processing image...' : 'Upload Character Photo'}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop an image here, or click to select
              </p>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || characterReferences.length >= maxCharacters}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Image
              </Button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {characterReferences.length >= maxCharacters && (
          <p className="text-sm text-amber-600 mt-2">
            Maximum {maxCharacters} character references reached.
          </p>
        )}
      </Card>

      {/* Character References List */}
      {characterReferences.length > 0 && (
        <Card className="p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Uploaded Character References ({characterReferences.length}/{maxCharacters})
          </h4>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characterReferences.map((character) => (
              <div
                key={character.id}
                className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Remove Button */}
                <Button
                  type="button"
                  onClick={() => handleRemoveCharacter(character.id)}
                  className="absolute top-2 right-2 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 text-red-600 rounded-full z-10"
                  title="Remove character"
                >
                  <X className="w-3 h-3" />
                </Button>

                {/* Character Image */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                  <Image
                    src={`data:${character.mimeType};base64,${character.imageData}`}
                    alt={character.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Character Info */}
                <div>
                  <h5 className="font-medium text-gray-900 text-sm truncate mb-1">
                    {character.name}
                  </h5>
                  {character.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {character.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Uploaded {character.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Usage Instructions */}
      {characterReferences.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900 mb-1">Using Character References</h5>
              <p className="text-sm text-blue-800">
                When selecting images for each scene, you'll see an option to replace characters with your uploaded references. 
                Simply describe what you want: "Replace the person in this ad with [Character Name]" or "Use [Character Name] as the main character."
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CharacterReferenceUpload;
