package main

import (
	"context"
	"os"

	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) makeMenu() *menu.Menu {
	AppMenu := menu.NewMenu()
	FileMenu := AppMenu.AddSubmenu("File")
	FileMenu.Append(&menu.MenuItem{
		Label: "Open XML file",
		Type:  menu.TextType,
		Click: func(cd *menu.CallbackData) {
			runtime.EventsEmit(a.ctx, "open")
		},
	})
	return AppMenu
}

func (a *App) OpenVault() string {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Filters: []runtime.FileFilter{{
			Pattern: "*.*",
		}},
	})
	if err == nil {
		return selection
	}
	return ""
}

func (a *App) LoadTextFile(name string) string {
	dat, err := os.ReadFile(name)
	if err == nil {
		fileContent := string(dat)
		return fileContent
	}
	return ""
}
