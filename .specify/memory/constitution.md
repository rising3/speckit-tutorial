<!--
Sync Impact Report:
Version Change: None → 1.0.0
Modified Principles: N/A (Initial constitution)
Added Sections:
  - Core Principles (4 principles)
  - Performance Standards
  - Development Workflow
  - Governance
Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - User scenarios and requirements align with UX consistency principle
  ✅ tasks-template.md - Task organization supports testability and quality principles
Follow-up TODOs: None
-->

# SpecKit Tutorial Constitution

## Core Principles

### I. Code Quality First (NON-NEGOTIABLE)

Code MUST be clean, maintainable, and self-documenting before being merged:

- **Readability**: Code MUST be understandable by team members without extensive comments. Variable and function names MUST be descriptive and follow consistent naming conventions.
- **Modularity**: Code MUST be organized into small, single-purpose functions and modules with clear boundaries and minimal coupling.
- **Code Reviews**: All code changes MUST pass peer review focusing on readability, maintainability, and adherence to project standards.
- **Static Analysis**: Code MUST pass linting and static analysis tools with zero violations before merge.
- **Documentation**: Public APIs and complex logic MUST include inline documentation explaining purpose, parameters, and return values.

**Rationale**: High-quality code reduces technical debt, accelerates feature development, and minimizes bugs in production. Poor code quality compounds over time, making maintenance exponentially more expensive.

### II. Test-Driven Development (NON-NEGOTIABLE)

Testing MUST drive the development process, not follow it:

- **Test-First Mandatory**: Tests MUST be written and approved before implementation begins. Implementation proceeds only after tests fail as expected.
- **Red-Green-Refactor**: Strict adherence to the TDD cycle: Write failing test → Implement minimal code to pass → Refactor for quality.
- **Coverage Requirements**: New code MUST achieve minimum 80% code coverage. Critical paths and business logic MUST achieve 100% coverage.
- **Test Types Required**:
  - Unit tests for individual functions and components
  - Integration tests for multi-component interactions
  - Contract tests for API boundaries and external interfaces
- **Test Quality**: Tests MUST be independent, repeatable, and fast. Flaky tests MUST be fixed immediately or removed.

**Rationale**: TDD ensures code correctness from the start, creates living documentation, enables confident refactoring, and catches regressions early. Testing after implementation often leads to incomplete coverage and tests that merely confirm existing behavior rather than specify requirements.

### III. User Experience Consistency

User-facing features MUST deliver a consistent, intuitive experience:

- **Design Patterns**: UI components and interactions MUST follow established patterns within the application. New patterns require design review and documentation.
- **Accessibility**: All interfaces MUST be accessible (keyboard navigation, screen reader support, sufficient color contrast, responsive design).
- **Error Handling**: User-facing errors MUST be clear, actionable, and consistent in format. Technical details MUST be logged but not exposed to users.
- **Response Times**: User actions MUST provide immediate feedback (loading indicators, progress bars) for operations taking >100ms.
- **Cross-Platform Consistency**: Features MUST behave identically across supported platforms and browsers unless platform differences are explicitly documented and justified.

**Rationale**: Consistent UX reduces cognitive load, improves user satisfaction, and decreases support costs. Inconsistent experiences confuse users and damage product credibility.

### IV. Performance Requirements

Performance MUST be measured, monitored, and maintained:

- **Baseline Metrics**: All features MUST define performance baselines before implementation (response time, memory usage, throughput).
- **Performance Testing**: Performance-critical features MUST include automated performance tests that fail if metrics degrade beyond defined thresholds.
- **Optimization Priority**: Performance optimization MUST occur only when measurements show actual problems. Premature optimization is discouraged.
- **Monitoring**: Production systems MUST emit performance metrics (response times, error rates, resource utilization) for continuous monitoring.
- **Performance Budgets**:
  - API responses: p95 < 500ms, p99 < 1000ms
  - Page load: First Contentful Paint < 1.5s, Time to Interactive < 3.5s
  - Database queries: < 100ms for simple queries, < 500ms for complex queries
  - Memory: No memory leaks; heap growth MUST be bounded and predictable

**Rationale**: Performance directly impacts user experience and operational costs. Proactive performance management prevents issues that are expensive to fix in production.

## Performance Standards

### Response Time Requirements

- **Critical user actions** (search, navigation, form submission): < 200ms p95
- **Background operations** (reports, exports): < 5s with progress indication
- **Batch processing**: Throughput MUST support peak load + 50% headroom

### Resource Efficiency

- **Memory**: Applications MUST run within allocated memory limits; no unbounded growth
- **CPU**: Operations MUST not block main thread for >16ms (60 fps requirement for UI)
- **Network**: Minimize payload sizes; use compression; implement caching strategies
- **Storage**: Implement data lifecycle policies; archive or delete unused data

### Scalability

- **Horizontal Scaling**: Services MUST be stateless or use external state stores to support horizontal scaling
- **Load Testing**: Features MUST be load-tested at 2x expected peak capacity before production deployment

## Development Workflow

### Quality Gates

All changes MUST pass these gates before merge:

1. **Tests Pass**: All automated tests (unit, integration, contract) pass successfully
2. **Coverage Met**: Code coverage meets or exceeds 80% threshold
3. **Linting Clean**: Static analysis and linting show zero violations
4. **Performance Validated**: Performance tests pass; no regression from baseline
5. **Peer Review**: At least one peer approval; all review comments resolved
6. **Documentation Updated**: README, API docs, and inline comments reflect changes

### Branch Strategy

- **Feature branches**: All work occurs in feature branches prefixed with issue number (e.g., `001-feature-name`)
- **Main branch protection**: Direct commits to main forbidden; all changes via pull request
- **Short-lived branches**: Feature branches MUST be merged or closed within 5 days to minimize drift

### Continuous Integration

- **Automated builds**: Every commit triggers automated build and test execution
- **Fast feedback**: CI pipeline MUST complete within 10 minutes for quick feedback
- **Fail fast**: Pipeline MUST stop at first failure; do not proceed to deployment on any failure

## Governance

This Constitution supersedes all other development practices and guidelines. All team members MUST:

- Verify that code changes comply with these principles during code review
- Raise concerns when complexity or technical debt threaten principle adherence
- Propose Constitution amendments through documented RFC process

### Amendment Process

1. **Proposal**: Submit RFC documenting proposed change, rationale, and impact analysis
2. **Review**: Team reviews and discusses amendment; identifies affected systems
3. **Approval**: Amendment requires consensus approval from technical leadership
4. **Migration**: Create migration plan for existing code to comply with new requirements
5. **Version Update**: Increment constitution version per semantic versioning rules

### Version Management

- **MAJOR**: Breaking changes to principles (removing/redefining core requirements)
- **MINOR**: Adding new principles or expanding requirements
- **PATCH**: Clarifications, wording improvements, non-semantic updates

### Compliance

- All PRs MUST verify compliance with this Constitution
- Technical debt that violates principles MUST be documented with justification and remediation plan
- Regular audits (quarterly) MUST assess codebase compliance and identify remediation priorities

**Version**: 1.0.0 | **Ratified**: 2026-01-21 | **Last Amended**: 2026-01-21
