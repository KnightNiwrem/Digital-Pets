/**
 * Skills screen showing overview of all skills.
 */

import { SkillBar } from "@/components/skills/SkillBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameState } from "@/game/hooks/useGameState";
import { selectSkills } from "@/game/state/selectors";
import { SkillType } from "@/game/types/skill";

/**
 * All skill types in display order.
 */
const SKILL_ORDER: SkillType[] = [
  SkillType.Foraging,
  SkillType.Mining,
  SkillType.Fishing,
  SkillType.Scouting,
  SkillType.Crafting,
  SkillType.Trading,
  SkillType.Social,
];

/**
 * Skills screen displaying all player skills.
 */
export function SkillsScreen() {
  const { state } = useGameState();

  if (!state) {
    return null;
  }

  const skills = selectSkills(state);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <span>⭐</span>
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Improve your skills by performing related activities. Higher skill
            levels unlock better rewards and new content.
          </p>
        </CardContent>
      </Card>

      {/* Skill list */}
      <div className="grid gap-3">
        {SKILL_ORDER.map((skillType) => (
          <SkillBar key={skillType} skill={skills[skillType]} />
        ))}
      </div>
    </div>
  );
}
