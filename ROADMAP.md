# OpenPage Polish Roadmap

## Scoring: Ralph Wiggum Scale
- 1-3: "I'm in danger" (broken/missing core features)
- 4-5: "Me fail English?" (works but embarrassing gaps)
- 6-7: "I bent my wookiee" (decent but rough edges)
- 8-9: "I'm learnding!" (polished, few issues)
- 10: "I'm a unitard!" (perfection, ship it)

Current score: **6.5/10** "I bent my wookiee"

---

## Iteration 1: Critical Wiring (target: 7.5)
- [ ] Properties panel schemas for ALL 13 block types
- [ ] configStore persistence (localStorage, survives refresh)
- [ ] Component Library "Add" button actually adds block + navigates to editor
- [ ] Testimonials carousel navigation (prev/next)

## Iteration 2: Real Functionality (target: 8.0)
- [ ] Version history reads from actual undo stack (not mock data)
- [ ] JSON drawer is editable (paste JSON, apply)
- [ ] Agent chat Apply/Reject buttons work (apply patch to config)
- [ ] ? shortcut opens help modal with all shortcuts listed

## Iteration 3: Polish & Completeness (target: 8.5)
- [ ] Project-specific configs (clicking project card loads its config)
- [ ] Settings inputs persist to projectsStore
- [ ] Deploy "JSON Config" export actually downloads the file
- [ ] Logo Cloud uses SVG placeholder logos (not text)
- [ ] Viewport preview shows actual frame/bezel

## Iteration 4: Edge Cases & UX (target: 9.0)
- [ ] Empty states for all screens (no projects, no blocks)
- [ ] Block action buttons on canvas hover (duplicate/delete/move)
- [ ] Rename project from dashboard
- [ ] Confirm dialog before delete (project + block)
- [ ] Add block from Components screen wired to specific project

## Iteration 5: Final Spit-Shine (target: 9.5+)
- [ ] README with feature list
- [ ] Animation polish (page transitions, block add animation)
- [ ] Responsive dashboard grid on mobile
- [ ] SEO Google preview updates live from inputs
- [ ] Consistent focus states across all interactive elements

---

Track: Score after each iteration. Stop when Ralph says "I'm a unitard!"
