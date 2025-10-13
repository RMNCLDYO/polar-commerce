# Contributing to AISDK Storefront

Thank you for your interest in contributing to AISDK Storefront! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Development Guidelines](#development-guidelines)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/aisdk-storefront.git
   cd aisdk-storefront
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/RMNCLDYO/aisdk-storefront.git
   ```
4. **Keep your fork up to date**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

## Development Setup

### Prerequisites

- Node.js >= 20.9.0
- npm >= 10.0.0
- Git

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Set up Convex**:
   ```bash
   npx convex dev
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   ```
   https://localhost:3000
   ```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
npm run format       # Format code with ESLint
```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

1. **Clear title and description**
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** (if applicable)
6. **Environment details** (OS, browser, Node.js version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

1. **Clear title and description**
2. **Use case** (why is this enhancement needed?)
3. **Possible implementation**
4. **Alternative solutions** you've considered

### Your First Code Contribution

1. Look for issues labeled `good first issue` or `help wanted`
2. Comment on the issue to express interest
3. Wait for assignment before starting work
4. Ask questions if you need clarification

## Pull Request Process

### Before Submitting

1. **Ensure your code follows the style guide**
2. **Add tests** for new functionality
3. **Update documentation** as needed
4. **Run the test suite**: `npm run test`
5. **Run linting**: `npm run lint`
6. **Ensure no TypeScript errors**: `npx tsc --noEmit`

### PR Requirements

- [ ] All tests pass
- [ ] Code coverage >= 80%
- [ ] No ESLint errors
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] Commit messages follow guidelines
- [ ] PR description clearly explains changes

### Review Process

1. **Automated checks** must pass
2. **Code review** by at least one maintainer
3. **Address feedback** promptly
4. **Squash commits** if requested
5. **Merge** once approved

## Development Guidelines

### Code Style

- **TypeScript**: Use strict mode
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS classes
- **Formatting**: ESLint configuration
- **Imports**: Organized and sorted

### Best Practices

1. **Component Structure**:
   ```typescript
   // Good
   export function MyComponent({ prop1, prop2 }: Props) {
     // hooks first
     const [state, setState] = useState();

     // handlers next
     const handleClick = () => {};

     // render last
     return <div>...</div>;
   }
   ```

2. **Type Safety**:
   ```typescript
   // Avoid any types
   // Bad
   const data: any = fetchData();

   // Good
   const data: UserData = fetchData();
   ```

3. **Error Handling**:
   ```typescript
   try {
     await riskyOperation();
   } catch (error) {
     logger.error('Operation failed', { error });
     // Handle gracefully
   }
   ```

4. **Performance**:
   - Use React.memo for expensive components
   - Implement proper loading states
   - Optimize images with Next.js Image
   - Use dynamic imports for code splitting

### Security Guidelines

- Never commit secrets or API keys
- Sanitize user inputs
- Use parameterized queries
- Follow OWASP guidelines
- Report security issues privately

## Testing Requirements

### Test Coverage

- **Minimum**: 80% code coverage
- **Target**: 90% for critical paths
- **Required for**: All new features

### Test Types

1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: Component interactions
3. **E2E Tests**: Critical user flows (future)

### Writing Tests

```typescript
describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Updated text')).toBeInTheDocument();
  });
});
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(auth): add two-factor authentication

Implements TOTP-based 2FA for enhanced security.
Includes QR code generation and backup codes.

Closes #123
```

```bash
fix(cart): prevent duplicate items in cart

Fixes issue where rapid clicks would add multiple
instances of the same item.

Fixes #456
```

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex logic
- Include examples for utilities
- Update README for major changes

### API Documentation

- Document new endpoints
- Include request/response examples
- Specify error codes
- Update OpenAPI spec (if applicable)

## Community

### Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Discord**: Real-time chat (if available)
- **Email**: contact@yourdomain.com

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Annual contributor report

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

---

**Thank you for contributing to AISDK Storefront!** 🎉