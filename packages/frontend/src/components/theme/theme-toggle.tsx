import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@components/providers/theme-provider';
import { Button } from '@components/ui/Button';
import { cn } from '@lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 w-10 rounded-lg transition-colors",
        isDark 
          ? "text-warning hover:text-warning hover:bg-warning/10" 
          : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary"
      )}
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Moon className="h-[18px] w-[18px]" />
      ) : (
        <Sun className="h-[18px] w-[18px]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
