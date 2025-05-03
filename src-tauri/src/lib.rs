use enigo::{Enigo, Keyboard, Settings};
use tauri::{Emitter, Manager};

#[tauri::command]
fn keyboard_text(text: &str) {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    enigo.text(text).unwrap();
}

const LABEL_WINDOW_MAIN: &str = "main";
const LABEL_WINDOW_SHELL: &str = "nekopshell";
const LABEL_WINDOW_RESCUE: &str = "nekopsrescue";

const EVENT_WINDOW_CLOSE_MAIN: &str = "windowCloseMain";
const EVENT_WINDOW_CLOSE_SHELL: &str = "windowCloseShell";
const EVENT_WINDOW_CLOSE_RESCUE: &str = "windowCloseRescue";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![keyboard_text])
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                let window_label = window.label();
                match window_label {
                    LABEL_WINDOW_MAIN => {
                        if window.app_handle().webview_windows().len() > 1 {
                            // Is not the only window
                            // window.minimize().unwrap(); // Minimize main window
                            window
                                .app_handle()
                                .emit(EVENT_WINDOW_CLOSE_MAIN, false)
                                .unwrap(); // Trigger an event for frontend to handle
                            api.prevent_close(); // And prevent close
                        }
                    }
                    LABEL_WINDOW_SHELL => {
                        window
                            .app_handle()
                            .emit(EVENT_WINDOW_CLOSE_SHELL, false)
                            .unwrap();
                        api.prevent_close();
                    }
                    LABEL_WINDOW_RESCUE => {
                        window
                            .app_handle()
                            .emit(EVENT_WINDOW_CLOSE_RESCUE, false)
                            .unwrap();
                        api.prevent_close();
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
