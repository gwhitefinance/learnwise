
'use client';

import { useState } from "react";
import AIBuddy from "@/components/ai-buddy";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const tazSpecies = ["Zappy", "Seedling", "Ember", "Shelly", "Puff", "Goo", "Chirpy", "Sparky", "Rocky", "Splash", "Bear", "Panda", "Bunny", "Boo", "Roly", "Whispy", "Spikey", "Bubbles"];
const colors = ["#87CEEB", "#FFC0CB", "#98FF98", "#F0E68C", "#E6E6FA", "#FFA07A"];

export default function TazSpeciesPage() {
  const [selectedTaz, setSelectedTaz] = useState({ species: "Zappy", color: "#87CEEB" });

  return (
    <div className="h-full flex flex-col md:flex-row gap-8 p-8 bg-muted/30">
      <div className="md:w-1/2 lg:w-2/3 h-full flex flex-col items-center justify-center bg-card rounded-2xl p-8 border">
        <motion.div
          key={selectedTaz.species + selectedTaz.color}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="w-64 h-64 md:w-96 md:h-96"
        >
          <AIBuddy species={selectedTaz.species} color={selectedTaz.color} />
        </motion.div>
        <h2 className="text-4xl font-bold mt-4">{selectedTaz.species}</h2>
        <p className="text-muted-foreground">Selected Color: {selectedTaz.color}</p>
      </div>

      <div className="md:w-1/2 lg:w-1/3 flex flex-col gap-4">
        <Card>
            <CardContent className="p-4">
                 <h3 className="font-semibold mb-3">Species</h3>
                 <div className="grid grid-cols-3 gap-2">
                    {tazSpecies.map(species => (
                        <Button
                            key={species}
                            variant={selectedTaz.species === species ? "default" : "outline"}
                            onClick={() => setSelectedTaz(prev => ({...prev, species}))}
                            className="text-xs h-8"
                        >
                            {species}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Colors</h3>
                <div className="grid grid-cols-6 gap-2">
                    {colors.map(color => (
                        <button
                            key={color}
                            onClick={() => setSelectedTaz(prev => ({ ...prev, color }))}
                            className={cn(
                                "w-10 h-10 rounded-full border-2 transition-transform",
                                selectedTaz.color === color ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-muted'
                            )}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
