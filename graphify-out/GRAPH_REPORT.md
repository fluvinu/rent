# Graph Report - rent  (2026-06-24)

## Corpus Check
- 121 files · ~31,747 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 785 nodes · 1663 edges · 42 communities (37 shown, 5 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 128 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cbae0347`
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
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 70 edges
2. `Tenant` - 33 edges
3. `compilerOptions` - 17 edges
4. `FieldDefinition` - 16 edges
5. `Permission` - 13 edges
6. `Workflow` - 12 edges
7. `JwtUtil` - 12 edges
8. `useAuth()` - 12 edges
9. `FieldValidator` - 11 edges
10. `FilterNode` - 10 edges

## Surprising Connections (you probably didn't know these)
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/alert-dialog.tsx → frontend/src/lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/alert-dialog.tsx → frontend/src/lib/utils.ts
- `BreadcrumbSeparator()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/breadcrumb.tsx → frontend/src/lib/utils.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/breadcrumb.tsx → frontend/src/lib/utils.ts
- `CommandShortcut()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/command.tsx → frontend/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (42 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (71): FieldInput(), QuickRecordDialog(), api(), EntityRecord, EntityType, FieldDef, FieldType, getToken() (+63 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (22): Authentication, BeforeEach, AuthController, AuthControllerTest, CorsTest, GlobalExceptionHandler, TenantController, TenantControllerTest (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (53): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, @hookform/resolvers, input-otp (+45 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (34): AuthProvider(), consumeLastCapturedError(), renderErrorPage(), LovableErrorOptions, LovableEvents, reportLovableError(), Window, Route (+26 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (38): useIsMobile(), Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+30 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (10): Collection, Criteria, Double, FieldDefinition, IllegalArgumentException, Object, FilterNode, FieldValidator (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (9): EntityTypeController, ViewController, DeleteMapping, View, EntityType, GetMapping, PutMapping, ViewRepository (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (12): Boolean, Claims, Date, FilterChain, Function, HttpServletRequest, HttpServletResponse, OncePerRequestFilter (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (26): AccessDeniedException, Action, EntityRecordController, PermissionController, WorkflowController, EntityRecord, EntityType, Permission (+18 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (19): cn(), ButtonProps, buttonVariants, Calendar(), CalendarDayButton(), HoverCardContent, Pagination(), PaginationContent (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.19
Nodes (12): AbstractMongoClientConfiguration, Bean, MongoConfig, SecurityConfig, CorsConfigurationSource, HttpSecurity, MongoClient, MongoDatabaseFactory (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+21 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (11): 1. Architecture and Core Concepts, 2. Backend APIs, 3. Frontend Functionality and Portal Integration, Authentication (`/auth`), Authentication & Login Flow, Dynamic Entity Type Creation (`/entity/create`), Dynamic Record Rendering (`/entity/[entityId]`), Entity Records (`/api/records`) (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (9): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+1 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (8): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 33 - "Community 33"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 34 - "Community 34"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 35 - "Community 35"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 36 - "Community 36"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 37 - "Community 37"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

## Knowledge Gaps
- **294 isolated node(s):** `com.rnt:rent`, `WorkflowStep`, `SortSpec`, `PageSpec`, `EntityTypeRepository` (+289 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 9` to `Community 0`, `Community 4`, `Community 15`, `Community 17`, `Community 19`, `Community 21`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 31`, `Community 33`, `Community 34`, `Community 35`, `Community 36`, `Community 37`, `Community 40`, `Community 41`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `api()` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 2` to `Community 14`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `com.rnt:rent`, `WorkflowStep`, `SortSpec` to the rest of the system?**
  _294 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.056175047338523035 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0695970695970696 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.03773584905660377 - nodes in this community are weakly interconnected._