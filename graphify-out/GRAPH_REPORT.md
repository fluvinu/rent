# Graph Report - rent  (2026-06-27)

## Corpus Check
- 133 files · ~40,367 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 887 nodes · 2155 edges · 45 communities (41 shown, 4 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 131 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bc85d810`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 74 edges
2. `Tenant` - 35 edges
3. `FieldDefinition` - 23 edges
4. `EntityRecordService` - 20 edges
5. `WorkflowEngine` - 20 edges
6. `JwtUtil` - 18 edges
7. `Permission` - 17 edges
8. `Workflow` - 17 edges
9. `FilterNode` - 17 edges
10. `EntityType` - 17 edges

## Surprising Connections (you probably didn't know these)
- `FieldDefinition` --references--> `FieldType`  [EXTRACTED]
  backend/src/main/java/com/rnt/rent/entity/EntityType.java → frontend/src/lib/api.ts
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/alert-dialog.tsx → frontend/src/lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/alert-dialog.tsx → frontend/src/lib/utils.ts
- `BreadcrumbSeparator()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/breadcrumb.tsx → frontend/src/lib/utils.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/breadcrumb.tsx → frontend/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (45 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (12): FieldInput(), COLORS, Checkbox, Input, Table, TableBody, TableCaption, TableCell (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (31): AutoConfigureMockMvc, BeforeEach, AuthController, AuthControllerTest, CorsTest, EntityRecordController, EntityTypeController, TenantController (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (53): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, @hookform/resolvers, input-otp (+45 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (42): AuthProvider(), consumeLastCapturedError(), renderErrorPage(), LovableErrorOptions, LovableEvents, reportLovableError(), Window, Route (+34 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (38): useIsMobile(), Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+30 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (25): AccessDeniedException, GlobalExceptionHandler, Double, FieldDefinition, EntityRecord, ExceptionHandler, HttpClient, IllegalArgumentException (+17 more)

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (7): scripts, build, build:dev, dev, format, lint, preview

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (20): Template, TemplateEntity, TemplateField, TEMPLATES, Button, CardDescription, Command, CommandEmpty (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (33): Collection, PermissionController, WorkflowController, Criteria, Data, Document, EntityRecord, EntityType (+25 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (22): NavItem(), cn(), ButtonProps, buttonVariants, Calendar(), CalendarDayButton(), DrawerContent, DrawerDescription (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (29): AbstractMongoClientConfiguration, Authentication, Bean, Boolean, Claims, Component, MongoConfig, SecurityConfig (+21 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 13 - "Community 13"
Cohesion: 0.16
Nodes (18): AppShell(), SettingsDialog(), FieldDef, useAuth(), COLORS, CreateEntityType(), DraftField, FIELD_TYPES (+10 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+10 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 16 - "Community 16"
Cohesion: 0.27
Nodes (9): AppShellProps, ACCENT_COLORS, GalleryView(), GalleryViewProps, getPrimaryTextField(), KanbanViewProps, EntityRecord, EntityType (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (11): 1. Architecture and Core Concepts, 2. Backend APIs, 3. Frontend Functionality and Portal Integration, Authentication (`/auth`), Authentication & Login Flow, Dynamic Entity Type Creation (`/entity/create`), Dynamic Record Rendering (`/entity/[entityId]`), Entity Records (`/api/records`) (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (9): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (8): QuickRecordDialog(), AuthScreen(), Index(), Label, labelVariants, TabsContent, TabsList, TabsTrigger

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (8): api(), FieldType, getToken(), setToken(), AuthCtx, Ctx, Profile, PublicProfile

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (7): 1. Advanced Business Logic (The Immediate Priority), 2. Complex Relationships and Data Integrity, 3. Fine-Grained Security and Row-Level Permissions, 4. Audit Logging and Versioning, 5. Advanced UI Components (Frontend), Action Plan, Gap Analysis for Extending the Dynamic Metadata Platform

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (8): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 28 - "Community 28"
Cohesion: 0.40
Nodes (4): name, private, sideEffects, type

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 30 - "Community 30"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 33 - "Community 33"
Cohesion: 0.08
Nodes (16): AccordionContent, AccordionItem, AccordionTrigger, HoverCardContent, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot (+8 more)

### Community 34 - "Community 34"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 37 - "Community 37"
Cohesion: 0.09
Nodes (26): CalendarView(), CalendarViewProps, DOW, getPrimaryTextField(), MONTHS, BADGE_COLORS, COLUMN_COLORS, getColumns() (+18 more)

## Knowledge Gaps
- **315 isolated node(s):** `com.rnt:rent`, `com.rnt:rent`, `$schema`, `style`, `rsc` (+310 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FieldType` connect `Community 22` to `Community 8`, `Community 13`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.283) - this node is a cross-community bridge._
- **Why does `FieldDefinition` connect `Community 5` to `Community 8`, `Community 1`, `Community 22`?**
  _High betweenness centrality (0.219) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 9` to `Community 0`, `Community 4`, `Community 7`, `Community 13`, `Community 15`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 29`, `Community 30`, `Community 31`, `Community 33`, `Community 34`, `Community 37`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **What connects `com.rnt:rent`, `com.rnt:rent`, `$schema` to the rest of the system?**
  _315 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1471861471861472 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.03773584905660377 - nodes in this community are weakly interconnected._