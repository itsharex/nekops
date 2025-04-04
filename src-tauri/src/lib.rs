use tauri::{Manager, Emitter};
use enigo::{
    Enigo, Keyboard, Settings,
};

#[cfg(windows)]
use windows::Win32::{
    Foundation::{HANDLE},
    System::{
        Threading::GetCurrentProcess,
        Console::{COORD, SetConsoleScreenBufferSize},
    },
};

#[cfg(unix)]
use nix::libc::ioctl;

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

// Convert pid to handle
//   Pids and handles are 2 different things - pid is only a property of handle,
//   so there's no way to simply "convert pid to handle".
//   The actual approach here is to query all child process from self (parent), then filter the
//   process with specified pid and extract its handle.
//   This only works on Windows system as we should be able to send signal directly to pid on unix.
#[cfg(windows)]
unsafe fn convert_pid_to_handle(pid: u32) -> Option<HANDLE> {
    println!("Trying to find child process with pid {}", pid);

    // Step 1: get current handle
    let app_handle = GetCurrentProcess();

    // Step 2: list child process to find any possible match
    Some(app_handle) // THIS IS WRONG IMPLEMENTATION! ONLY TO PASS COMPILE! // TODO
}

#[cfg(windows)]
#[tauri::command]
fn set_ssh_size(pid: u32, row: i16, col: i16, width: i16, height: i16) {
    println!("Set ssh size: pid {pid}, rows {row}, cols {col}, width {width}, height {height}");

    unsafe {
        let Some(handle) = convert_pid_to_handle(pid) else {
            eprintln!("Error setting SSH size: no matching process");
            return
        };

        let resize_res = SetConsoleScreenBufferSize(handle, COORD {X: row, Y: col});
        match resize_res {
            Ok(_) => {},
            Err(error) => eprintln!("Error setting SSH size: {}", error),
        }
    }

}

#[cfg(unix)]
#[tauri::command]
fn set_ssh_size(pid: u64, row: u16, col: u16, width: u16, height: u16) {
    println!("Set ssh size: pid {pid}, rows {row}, cols {col}, width {width}, height {height}");
    // ioctl_write_ptr!();
}

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
        .invoke_handler(tauri::generate_handler![set_ssh_size])
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
