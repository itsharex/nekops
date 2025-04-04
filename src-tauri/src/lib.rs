use tauri::{Manager, Emitter};
use enigo::{
    Enigo, Keyboard, Settings,
};

// #[cfg(unix)]
// use nix::sys::ioctl;

/* Required by tauri_plugin_single_instance
#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}
*/

#[tauri::command]
fn keyboard_text(text: &str) {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    enigo.text(text).unwrap();
}

// #[cfg(windows)]
// #[tauri::command]
// fn set_ssh_size(pid: u64, row: u16, col: u16, x_pixel: u16, y_pixel: u16) {
//     println!("Set ssh size: pid {pid}, rows {row}, cols {col}, x_pixel {x_pixel}, y_pixel {y_pixel}");
//     // TODO
// }
//
// #[cfg(unix)]
// #[tauri::command]
// fn set_ssh_size(pid: u64, row: u16, col: u16, x_pixel: u16, y_pixel: u16) {
//     println!("Set ssh size: pid {pid}, rows {row}, cols {col}, x_pixel {x_pixel}, y_pixel {y_pixel}");
//     // ioctl_read!()
//     // TODO
// }

const MAIN_WINDOW_LABEL: &str = "main";
const SHELL_WINDOW_LABEL: &str = "nekopshell";

const MAIN_WINDOW_PRE_CLOSE_EVENT: &str = "mainWindowPreClose";
const SHELL_WINDOW_PRE_CLOSE_EVENT: &str = "shellWindowPreClose";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        /* Disabled due to lack of stability
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            // Find main window of existing instance
            let main_window_option = app.get_webview_window(MAIN_WINDOW_LABEL);

            if let Some(main_window) = main_window_option {
                // Focus on existing main window
                main_window.unminimize().expect("Can't un-minimize Window");
                main_window.set_focus().expect("Can't focus Window");
            } else {
                // Start main window and focus
                // For initialize values please refer to src-tauri/tauri.conf.json
                let main_window = tauri::WebviewWindowBuilder::new(
                    app,
                    MAIN_WINDOW_LABEL, /* the unique window label */
                    tauri::WebviewUrl::App("index.html".into())
                )
                    .title("Nekops") // Initial title
                    .inner_size(1200.0, 800.0) // Initial size
                    .build()
                    .unwrap();
                main_window.set_focus().unwrap();
            }

            // Print message
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            app.emit("single-instance", Payload { args: argv, cwd }).unwrap();
        }))
        */
        // .plugin(tauri_plugin_window::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![keyboard_text])
        // .invoke_handler(tauri::generate_handler![set_ssh_size])
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                let window_label = window.label();
                match window_label {
                    MAIN_WINDOW_LABEL => {
                        if window.app_handle().webview_windows().len() > 1 { // Is not the only window
                            // window.minimize().unwrap(); // Minimize main window
                            window.app_handle().emit(MAIN_WINDOW_PRE_CLOSE_EVENT, false).unwrap(); // Trigger an event for frontend to handle
                            api.prevent_close(); // And prevent close
                        }
                    }
                    SHELL_WINDOW_LABEL => {
                        window.app_handle().emit(SHELL_WINDOW_PRE_CLOSE_EVENT, false).unwrap();
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
