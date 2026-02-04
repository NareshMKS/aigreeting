import { useState, useMemo, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useGoogleFonts, groupFontsByCategory, getCategoryDisplayName } from '@/hooks/useGoogleFonts';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FontSelectorProps {
  value: string;
  onChange: (fontFamily: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { fonts, isLoading, error, loadFont, loadedFonts } = useGoogleFonts();

  // Load the currently selected font
  useEffect(() => {
    if (value) {
      loadFont(value);
    }
  }, [value, loadFont]);

  // Group and filter fonts
  const groupedFonts = useMemo(() => {
    const filtered = searchQuery
      ? fonts.filter(font => 
          font.family.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : fonts.slice(0, 200); // Limit initial display for performance

    return groupFontsByCategory(filtered);
  }, [fonts, searchQuery]);

  const handleSelect = (fontFamily: string) => {
    loadFont(fontFamily);
    onChange(fontFamily);
    setOpen(false);
  };

  // Get display value
  const displayValue = value || 'Select font...';

  if (error) {
    return (
      <div className="h-9 px-3 rounded-md border border-destructive bg-destructive/10 flex items-center text-sm text-destructive">
        Failed to load fonts
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 font-normal"
          style={{ fontFamily: loadedFonts.has(value) ? value : 'inherit' }}
        >
          <span className="truncate">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading fonts...
              </span>
            ) : (
              displayValue
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : Object.keys(groupedFonts).length === 0 ? (
                <CommandEmpty>No fonts found.</CommandEmpty>
              ) : (
                Object.entries(groupedFonts).map(([category, categoryFonts]) => (
                  <CommandGroup 
                    key={category} 
                    heading={getCategoryDisplayName(category)}
                    className="px-2"
                  >
                    {categoryFonts.map((font) => (
                      <CommandItem
                        key={font.family}
                        value={font.family}
                        onSelect={() => handleSelect(font.family)}
                        className="flex items-center gap-2 cursor-pointer"
                        onMouseEnter={() => loadFont(font.family)}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            value === font.family ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span 
                          className="truncate"
                          style={{ fontFamily: loadedFonts.has(font.family) ? font.family : 'inherit' }}
                        >
                          {font.family}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))
              )}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
