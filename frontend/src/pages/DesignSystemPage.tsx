import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input } from '../components/ui';

export function DesignSystemPage() {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎨 Design System
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Apple Glass inspired component library
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm">
                Small
              </Button>
              <Button variant="primary" size="md">
                Medium
              </Button>
              <Button variant="primary" size="lg">
                Large
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="warning">Warning</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
            </CardHeader>
            <CardContent>
              Standard white background with border and shadow.
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
            </CardHeader>
            <CardContent>
              Translucent background with blur effect (70% opacity).
            </CardContent>
          </Card>

          <Card variant="glass-strong">
            <CardHeader>
              <CardTitle>Glass Strong</CardTitle>
            </CardHeader>
            <CardContent>
              More opaque glass effect (85% opacity) with stronger blur.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Cards */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Interactive Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" interactive>
            <div className="text-4xl mb-3">📊</div>
            <CardTitle className="mb-2">Dashboard</CardTitle>
            <CardContent>
              Hover to see lift effect. Click for interaction.
            </CardContent>
          </Card>

          <Card variant="glass" interactive>
            <div className="text-4xl mb-3">📁</div>
            <CardTitle className="mb-2">Folders</CardTitle>
            <CardContent>
              Interactive card with smooth transitions.
            </CardContent>
          </Card>

          <Card variant="glass" interactive>
            <div className="text-4xl mb-3">💰</div>
            <CardTitle className="mb-2">Quotes</CardTitle>
            <CardContent>
              Glass effect with hover and active states.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <Input
              label="Client name"
              placeholder="Enter name..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setInputError('');
              }}
            />
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              error={inputError}
              onBlur={(e) => {
                if (e.target.value && !e.target.value.includes('@')) {
                  setInputError('Invalid email format');
                }
              }}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
            />
            <Input
              label="Disabled"
              placeholder="Disabled input"
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-blue-600"></div>
              <p className="text-sm font-medium">Primary Blue</p>
              <p className="text-xs text-gray-500">#007AFF</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-green-600"></div>
              <p className="text-sm font-medium">Success Green</p>
              <p className="text-xs text-gray-500">#34C759</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-red-600"></div>
              <p className="text-sm font-medium">Danger Red</p>
              <p className="text-xs text-gray-500">#FF3B30</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-orange-600"></div>
              <p className="text-sm font-medium">Warning Orange</p>
              <p className="text-xs text-gray-500">#FF9500</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

