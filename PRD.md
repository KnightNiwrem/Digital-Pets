# Digital Pets - Product Requirements Document

## Executive Summary

Digital Pets is a purely client-side HTML5 pet raising game that captures the nostalgia of classic virtual pets while offering modern gameplay mechanics and progression systems. The game provides a complete offline experience with automatic state preservation and ~2 years of natural progression.

## Product Vision

Create an engaging, accessible pet simulation game that:
- Works completely offline without server dependencies
- Provides long-term progression through 50+ growth stages
- Teaches nurturing through realistic pet care mechanics
- Offers exploration and discovery in a rich game world
- Runs on any device with a modern web browser

## Target Audience

### Primary Users
- **Nostalgia Gamers**: Adults (25-40) who played virtual pets in childhood
- **Casual Gamers**: Players seeking low-commitment, drop-in gaming experiences
- **Pet Simulation Fans**: Users who enjoy care-taking and nurturing gameplay

### Secondary Users
- **Children**: Learning responsibility through virtual pet care
- **Busy Professionals**: Need games that progress during offline time
- **Offline Gamers**: Users with limited or unreliable internet access

## Core Features

### 1. Pet System
**Priority**: P0 (Critical)
**Description**: Core pet mechanics with care stats, growth, and health systems

**Requirements**:
- 31 total pets across 5 rarity tiers (10 common, 8 uncommon, 6 rare, 4 epic, 3 legendary)
- 3 starter pets (common rarity) for initial selection
- Care stats displayed as integers: Satiety, Hydration, Happiness
- Hidden internal counters: `satietyTicksLeft`, `hydrationTicksLeft`, `happinessTicksLeft`
- Stat calculation: `Math.ceil(ticksLeft / multiplier)` per stat
- Health states: Healthy, Injured, Sick (with specific illnesses)
- 50 growth stages over ~2 real years
- Max Energy increases per stage (starting at 100)
- Energy recovery faster during sleep in later stages
- Pet states: Idle (default), Sleeping, Travelling
- Life system (1,000,000 max) - death triggers restart

**Acceptance Criteria**:
- [ ] Player can select from 3 starter pets
- [ ] Care stats display correctly and update in real-time
- [ ] Pet grows through stages over time
- [ ] Health states affect pet behavior and appearance
- [ ] Death system resets to starter selection

### 2. Game Loop & Persistence
**Priority**: P0 (Critical)
**Description**: 15-second tick system with offline progression and autosave

**Requirements**:
- Game tick every 15 seconds
- Autosave game state every tick with timestamp
- Load game calculates offline progression using time difference
- Stat depletion decreases hidden counters by 1 per tick
- Life mechanics per tick:
  - Decrease: 100 (injured), 200 (sick), 300 (0 satiety), 500 (0 hydration), 1 (final growth stage)
  - Recovery: +1 if life did not decrease
- Web Storage API for all persistence (no server dependencies)

**Acceptance Criteria**:
- [ ] Game saves automatically every 15 seconds
- [ ] Offline time is calculated correctly on game load
- [ ] Pet stats progress realistically during offline periods
- [ ] No data loss occurs during browser refresh or restart

### 3. Item System
**Priority**: P0 (Critical)
**Description**: Consumables, durability items, medicine, and hygiene management

**Requirements**:
- Consumables (food/drinks) vs. Durability items (toys)
- Medicine for treating health states
- Hygiene items for poop cleaning
- Item usage affects pet stats immediately
- Inventory management with item stacking
- Item acquisition through shops, foraging, rewards

**Acceptance Criteria**:
- [ ] Items can be used from inventory on pet
- [ ] Consumables are removed after use, durability items degrade
- [ ] Medicine cures appropriate health conditions
- [ ] Hygiene items clean poop effectively

### 4. Poop & Hygiene System
**Priority**: P1 (High)
**Description**: Realistic hygiene mechanics affecting pet health

**Requirements**:
- `poopTicksLeft` counter with random reset after pooping
- `sickByPoopTicksLeft` (resets to 17,280 ticks when clean)
- Counter decreases faster when more poop is present
- When `sickByPoopTicksLeft` reaches 0, pet becomes sick
- Hygiene items required for cleaning

**Acceptance Criteria**:
- [ ] Pet poops at realistic intervals
- [ ] Uncleaned poop leads to sickness over time
- [ ] Cleaning items effectively remove poop
- [ ] Visual indicators show poop presence

### 5. Energy System
**Priority**: P1 (High)
**Description**: Activity-based energy consumption without passive depletion

**Requirements**:
- Energy consumed through activities (battles, training, exploration)
- No passive energy loss during idle time
- Energy recovery through sleep state
- Energy booster items available
- Energy limits activities when depleted

**Acceptance Criteria**:
- [ ] Activities consume appropriate energy amounts
- [ ] Energy does not decrease during idle time
- [ ] Sleep restores energy over time
- [ ] Energy boosters work correctly

### 6. World & Travel System
**Priority**: P1 (High)
**Description**: Multiple locations with travel mechanics and activities

**Requirements**:
- Starting city + multiple destination locations
- Time-based "travelling" state between locations
- Travel blocks sleep during transit
- Location-specific activities: foraging, fishing, mining
- Shops for buying/selling items
- NPCs with quest lines and conversations

**Acceptance Criteria**:
- [ ] Player can travel between unlocked locations
- [ ] Travel takes realistic time and blocks other activities
- [ ] Each location offers unique activities and NPCs
- [ ] Shops provide item trading functionality

### 7. Battle System
**Priority**: P2 (Medium)
**Description**: Turn-based combat with stat progression

**Requirements**:
- Battle stats: Attack, Defense, Speed, Health (current/max)
- Turn-based combat mechanics
- Move learning through training facilities
- Battle encounters with wild pets or NPCs
- Victory rewards (experience, items, currency)

**Acceptance Criteria**:
- [ ] Combat is strategic and engaging
- [ ] Pet stats affect battle outcomes
- [ ] New moves can be learned and equipped
- [ ] Battles provide meaningful progression

### 8. Quest System
**Priority**: P2 (Medium)
**Description**: NPC-driven quests with item turn-ins and tasks

**Requirements**:
- Multiple quest types: item collection, task completion, exploration
- Quest rewards: items, currency, pet unlocks
- Story progression through quest chains
- NPC interaction system for quest delivery

**Acceptance Criteria**:
- [ ] Quests provide clear objectives and rewards
- [ ] Quest progress persists through save/load
- [ ] Completed quests unlock new content
- [ ] NPCs provide engaging dialogue and lore

## Technical Requirements

### Platform Support
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Devices**: Desktop, tablet, mobile (responsive design)
- **Storage**: Web Storage API support required
- **Network**: Fully offline capable

### Performance Targets
- **Load Time**: < 3 seconds initial load
- **Tick Processing**: < 100ms per 15-second tick
- **Memory Usage**: < 100MB RAM
- **Storage**: < 10MB local storage
- **Battery**: Minimal impact on mobile devices

### Technical Stack
- **Runtime**: Bun for development and building
- **Frontend**: React 19 with TypeScript
- **Styling**: TailwindCSS with shadcn/ui components
- **Storage**: Web Storage API (localStorage)
- **Build**: Custom build system with hot reload

### Quality Requirements
- **Type Safety**: Strict TypeScript, no `any` or `unknown` types
- **Code Quality**: Linting and formatting passes
- **Testing**: Unit and integration tests for all systems
- **Build**: Production builds successfully
- **Accessibility**: WCAG 2.1 AA compliance

## Success Metrics

### Engagement Metrics
- **Daily Active Users**: Players return for daily pet care
- **Session Length**: Average 10-15 minutes per session
- **Retention**: 60% 7-day retention, 30% 30-day retention

### Progression Metrics
- **Pet Growth**: 80% of pets reach stage 10+
- **Location Discovery**: 70% of players visit 5+ locations
- **Pet Collection**: 50% of players obtain 5+ different pets

### Technical Metrics
- **Save Success Rate**: 99.9% successful autosaves
- **Load Performance**: 95% of loads complete in < 3 seconds
- **Error Rate**: < 0.1% critical errors

## Release Timeline

### Phase 1: Foundation (Weeks 1-2)
- Core data models and TypeScript interfaces
- Web Storage API integration
- Basic game loop and tick system
- Simple pet care UI

### Phase 2: Core Systems (Weeks 3-4)
- Complete pet system with growth and health
- Item system with inventory management
- Poop and hygiene mechanics
- Energy system

### Phase 3: World Building (Weeks 5-6)
- Location system and travel mechanics
- World activities (foraging, fishing, mining)
- Shop system and item trading
- Basic NPC interactions

### Phase 4: Combat & Quests (Weeks 7-8)
- Turn-based battle system
- Move learning and training facilities
- Quest system with NPC storylines
- Advanced progression mechanics

### Phase 5: Polish & Launch (Weeks 9-10)
- UI/UX improvements and animations
- Performance optimization
- Comprehensive testing
- Documentation and deployment

## Risk Assessment

### High Risk
- **Complex State Management**: Offline progression calculations
- **Data Persistence**: Save corruption or loss
- **Performance**: Game loop efficiency with complex calculations

### Medium Risk
- **Browser Compatibility**: Storage API differences
- **User Experience**: Balancing progression difficulty
- **Content Scope**: Feature creep affecting timeline

### Mitigation Strategies
- Comprehensive testing of save/load systems
- Performance monitoring and optimization
- Phased feature rollout with user feedback
- Regular prototype testing with target users

## Dependencies

### Internal Dependencies
- Design team for pet artwork and UI assets
- Content team for NPC dialogue and quest writing
- QA team for comprehensive testing

### External Dependencies
- None (fully self-contained client-side application)

## Assumptions

1. Players have modern browsers with Web Storage support
2. Users understand basic virtual pet care concepts
3. Offline progression is a key value proposition
4. Simple, accessible UI is preferred over complex interfaces
5. Long-term progression keeps players engaged over months